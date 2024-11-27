use std::fs;
use std::str::FromStr;
use std::string::ToString;
use reqwest::{Client, Url};
use tauri::async_runtime::{spawn, Mutex};
use tauri::State;
use crate::{routes, standard, AppState};
use crate::basedir::BaseDirectory;
use crate::core::address::P2PKHAddress;
use crate::core::transaction::Transaction;
use crate::core::utxo::UTXO;
use crate::models::NewTransaction;
use crate::standard::standard_serialize;
use crate::wallet::{UnableToCreateError, UnableToLoadError, Wallet};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn is_valid_address(address: &str) -> bool {
	P2PKHAddress::from_string(address.to_string()).is_ok()
}


/// Returns (balance, wallet_creation_second, resonance_sent)
#[tauri::command]
pub async fn get_wallet_info(state: State<'_, Mutex<AppState>>) -> Result<(u64, u64, i64), ()> {
	let s = state.lock().await;
	let info = s.wallet.clone().unwrap().info;
	Ok((info.balance, info.wallet_creation_second, info.resonance_sent))
}

#[tauri::command]
pub async fn create_transaction(
	address: &str,
	amount: u64,
	state: State<'_, Mutex<AppState>>
) -> Result<String, ()> {
	let mut s = state.lock().await; // Get a mutable lock on the state

	// Access the wallet mutably
	if let Some(ref mut wallet) = s.wallet {
		if P2PKHAddress::from_string(address.to_string()).is_ok() {
			wallet.update_utxos().await;
		}

		// Perform modifications on the wallet
		match P2PKHAddress::from_string(address.to_string()) {
			Ok(address) => {
				match wallet.create_transaction(
					amount,
					address,
				) {
					None => {
						return Ok("Not enough balance".into());
					}
					Some(tx) => {
						for output in &tx.output_list {
							let k: i64 = if output.address == wallet.key_chain.address { 1 } else { -1 };
							wallet.info.resonance_sent += (k * output.amount as i64);
						}
						let client = Client::new();
						let msg = NewTransaction {
							version: 0,
							transaction: tx,
						};
						let bytes = standard_serialize(&msg);
						let trusted_peers = wallet.trusted_peers.clone();
						spawn(async move {
							for mut p in trusted_peers.clone() {
								p.set_path(routes::NEW_TRANSACTION_URL);

								client.post(p)
									.body(bytes.clone())
									.header(reqwest::header::CONTENT_TYPE, standard::DATA_TYPE)
									.send().await.ok();
							}
						});
					}
				}
			},
			Err(err) => {
				return Ok(err.to_string())
			}
		}


	} else {
		return Ok("".into()); // Wallet is None, handle error
	}

	Ok("".into())
}

// #[tauri::command]
// pub fn does_wallet_exist() -> bool {
// 	let data_dir = BaseDirectory::get_base_directory();
// 	let path = &format!("{}/{}", data_dir, KEYCHAIN_FILE);
// 	Path::new(path).exists()
// }

#[tauri::command]
pub async fn is_wallet_loaded(state: State<'_, Mutex<AppState>>) -> Result<bool, ()> {
	let s = state.lock().await;
	Ok(s.wallet.is_some())
}
#[tauri::command]
pub async fn get_wallet_address(state: State<'_, Mutex<AppState>>) -> Result<String, ()> {
	let state = state.lock().await;
	match &state.wallet {
		Some(w) => {
			Ok(w.key_chain.address.to_string())
		}
		None => {
			Err(())
		}
	}
}
#[tauri::command]
pub async fn try_load_wallet(name: &str, password: &str, state: State<'_, Mutex<AppState>>) -> Result<(), UnableToLoadError> {
	let mut s = state.lock().await;
	let wallet = Wallet::load(name, password).await?;

	s.wallet = Some(wallet);
	Ok(())
}

#[tauri::command]
pub async fn try_unload_wallet(state: State<'_, Mutex<AppState>>) -> Result<(), ()> {
	let mut s = state.lock().await;
	s.wallet = None;
	Ok(())
}

#[tauri::command]
pub async fn create_new_wallet(name: &str, password: &str, trusted_peers: Vec<&str>) -> Result<(), UnableToCreateError> {
	let mut trusted_peers2 = vec![];
	for p in trusted_peers {
		trusted_peers2.push(Url::from_str(p).unwrap());
	}
	Wallet::create(name, password, trusted_peers2)?;
	Ok(())
}

#[tauri::command]
pub async fn save_wallet_to_file(state: State<'_, Mutex<AppState>>) -> Result<(), ()> {
	let mut state = state.lock().await;
	if let Some(ref mut wallet) = state.wallet {
		wallet.write();
		Ok(())
	} else {
		Err(())
	}
}
#[tauri::command]
pub fn is_valid_url(url: &str) -> bool {
	Url::from_str(url).is_ok_and(|x| x.scheme() == "http" || x.scheme() == "https")
}
#[tauri::command]
pub async fn test(state: State<'_, Mutex<AppState>>) -> Result<(), ()> {
	let mut s = state.lock().await; // Get a mutable lock on the state
	// Access the wallet mutably
	if let Some(ref mut wallet) = s.wallet {
		for i in 0..100 {
			wallet.utxos.push(UTXO {
				txid: [0u8; 32],
				output_index: i as usize,
				amount: 0,
				recipient_address: P2PKHAddress::random().0,
			})
		}
	}
	Ok(())
}
#[tauri::command]
pub fn get_available_wallet_names() -> Vec<String> {
	let data_dir = BaseDirectory::get_base_directory();
	let mut names: Vec<String> = vec![];
	for entry in fs::read_dir(data_dir.as_str()).unwrap() {
		let path = entry.unwrap().path();
		if path.is_file() {
			names.push(path
				.file_stem()
				.unwrap()
				.to_os_string()
				.into_string()
				.unwrap()
			);
		}
	}
	names
}