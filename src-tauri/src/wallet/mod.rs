use std::fs;
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use std::time::UNIX_EPOCH;
use base58::ToBase58;
use regex::Regex;
use reqwest::{Client, Error, Url};
use serde::{Deserialize, Serialize};
use crate::basedir::BaseDirectory;
use crate::core::address::P2PKHAddress;
use crate::core::transaction::Transaction;
use crate::core::utxo::{Input, Output, UTXO};
use key_chain::KeyChain;
use crate::models::{GetUTXOs, UTXOs};
use crate::{routes, standard};
use crate::standard::{standard_deserialize, standard_serialize};
use crate::wallet::wallet_info::WalletInfo;
use crate::wallet::wallet_security::EncryptedObject;

mod wallet_security;
mod key_chain;
mod wallet_info;

#[derive(Serialize, Deserialize)]
pub enum UnableToLoadError {
	FileNotFound,
	CorruptedFile,
	IncorrectPassword,
}
#[derive(Serialize, Deserialize, Debug)]
pub enum UnableToCreateError {
	WalletAlreadyExists,
	InvalidName,
	UnableToWriteToFile(String)
}

// pub const KEYCHAIN_FILE: &str = "wallet.bin";

#[derive(Serialize, Deserialize, Clone)]
pub struct Wallet {
	pub key_chain: KeyChain,
	pub utxos: Vec<UTXO>,
	pub info: WalletInfo,
	pub trusted_peers: Vec<reqwest::Url>,
	pub name: String,
	pub password: String,
}
impl Wallet {
	pub async fn load(name: &str, password: &str) -> anyhow::Result<Self, UnableToLoadError> {
		let data_dir = BaseDirectory::get_base_directory();
		if let Ok(mut wallet_file) = File::options().read(true).open(format!("{}/{}.bin", data_dir, name)) {
			let mut data = Vec::new();
			let _ = wallet_file.read_to_end(&mut data).map_err(|_| UnableToLoadError::CorruptedFile)?;

			let encrypted_wallet: EncryptedObject = EncryptedObject::load(data);

			let mut wallet: Wallet = encrypted_wallet.decrypt_object(password).map_err(|_| UnableToLoadError::IncorrectPassword)?;
			wallet.update_utxos().await;
			Ok(wallet)
		} else {
			Err(UnableToLoadError::FileNotFound)
		}
	}
	pub fn write(&self) -> bool{
		let data_dir = BaseDirectory::get_base_directory();
		fs::create_dir(&data_dir).ok();

		if let Ok(mut keychain_file) = File::options()
			.read(true)
			.write(true)
			.append(false)
			.open(format!("{}/{}.bin", data_dir, self.name))
		{
			let encrypted_key_chain = EncryptedObject::encrypt_object(&self, self.password.clone().as_str());
			encrypted_key_chain.decrypt_object::<Wallet>(self.password.clone().as_str()).ok();
			let serialized_encrypted_keychain = encrypted_key_chain.serialize();
			match keychain_file.write_all(&serialized_encrypted_keychain).map_err(|e| UnableToCreateError::UnableToWriteToFile(e.to_string())) {
				Ok(_) => {}
				Err(_) => {
				}
			}
			true
		} else {
			false
		}
	}
	
	pub fn create(name: &str, password: &str, trusted_peers: Vec<Url>) -> anyhow::Result<Self, UnableToCreateError> {
		let re = Regex::new("^[a-zA-Z0-9]{1,15}$").unwrap();
		if !re.is_match(name) {
			return Err(UnableToCreateError::InvalidName)
		}

		let data_dir = BaseDirectory::get_base_directory();
		fs::create_dir(data_dir).ok();
		let data_dir = BaseDirectory::get_base_directory();
		if Path::new(&format!("{}/{}.bin", data_dir, name)).exists() {
			return Err(UnableToCreateError::WalletAlreadyExists)
		}
		if let Ok(mut keychain_file) = File::options()
			.read(true)
			.write(true)
			.create_new(true)
			.open(format!("{}/{}.bin", data_dir, name))
		{
			let (address, signing_key, verifying_key) = P2PKHAddress::random();
			let mut wallet = Self {
				key_chain: KeyChain {
					signing_key,
					verifying_key,
					address,
				},
				utxos: vec![],
				info: WalletInfo::default(),
				trusted_peers,
				name: name.into(),
				password: password.into(),
			};
			let epoch_second = UNIX_EPOCH.elapsed().unwrap().as_secs();
			wallet.info.wallet_creation_second = epoch_second;
			let encrypted_key_chain = EncryptedObject::encrypt_object(&wallet, password);

			let serialized_encrypted_keychain = encrypted_key_chain.serialize();
			keychain_file.write_all(&serialized_encrypted_keychain).map_err(|e| UnableToCreateError::UnableToWriteToFile(e.to_string()))?;

			Ok(wallet)
		} else {
			Err(UnableToCreateError::UnableToWriteToFile("File not found".to_owned()))
		}
	}

	pub fn get_balance(&self) -> u64 {
		let mut amount = 0;
		for utxo in &self.utxos {
			amount += utxo.amount;
		}
		amount
	}
	pub async fn update_utxos(&mut self) {
		let client = Client::new();
		for mut url in self.trusted_peers.clone() {
			if !self.utxos.is_empty() {
				break;
			}
			let get_utxos = GetUTXOs{
				version: 0,
				address: self.key_chain.address,
			};
			url.set_path(routes::GET_UTXOS_URL);
			if let Ok(response) = client
				.get(Url::from(url.clone()))
				.header(reqwest::header::CONTENT_TYPE, standard::DATA_TYPE)
				.body(standard_serialize(&get_utxos))
				.send().await {
				match response.bytes().await.map(|x|x.to_vec()) {
					Ok(data) => {
						if let Ok(utxos) = standard_deserialize::<UTXOs>(data.as_slice()) {
							self.utxos = utxos.utxos;
						} else {
							eprint!("Unable to deserialize utxos from node");
						}
					}
					Err(_) => {}
				}
			}
		}
		for utxo in &self.utxos {
			self.info.balance += utxo.amount;
		}
	}

	/// Returns Option((utxos_to_use, change_if_needed))
	fn calculate_utxos_to_use(&mut self, target_amount: u64) -> Option<(Vec<UTXO>, u64)> {
		self.utxos.sort_by_key(|utxo| utxo.amount);
		let mut amount = 0;
		let mut utxos = vec![];
		for utxo in &self.utxos {
			if amount >= target_amount {
				break;
			}
			amount += utxo.amount;
			utxos.push(*utxo);
		}
		if amount >= target_amount {
			Some((utxos, amount - target_amount))
		} else {
			None
		}
	}
	
	pub fn create_transaction(&mut self, amount: u64, address: P2PKHAddress) -> Option<Transaction> {
		let (utxos, change) = self.calculate_utxos_to_use(amount)?;
		let mut inputs = Vec::new();
		for (i, utxo) in utxos.iter().enumerate() {
			inputs.push(Input {
				prev_txid: utxo.txid,
				output_index: utxo.output_index,
				signature: vec![],
				public_key: self.key_chain.verifying_key.clone(),
			});
		}
		let mut outputs = Vec::new();
		outputs.push(Output {
			amount,
			address,
		});
		if change != 0 {
			outputs.push(Output {
				amount: change,
				address: self.key_chain.address,
			});
		}
		let mut tx = Transaction::create_transaction(inputs, outputs);
		tx.sign_inputs(&self.key_chain.signing_key).ok()?;

		Some(tx)
	}
}
