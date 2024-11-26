use std::fs::{create_dir_all, OpenOptions};
use std::io::Write;
use std::path::Path;
use blake3::IncrementCounter::No;
use serde::{Deserialize, Serialize};
use crate::basedir::BaseDirectory;
use crate::core::address::{P2PKHAddress, SigningKey, VerifyingKey};


#[derive(Clone, Deserialize, Serialize)]
pub struct KeyChain {
	pub signing_key: SigningKey,
	pub verifying_key: VerifyingKey,
	pub address: P2PKHAddress,
}
impl KeyChain {
	pub fn random() -> Self {
		let a  = P2PKHAddress::random();
		Self {
			signing_key: a.1,
			verifying_key: a.2,
			address: a.0,
		}
	}
	pub fn load(path: &Path) -> Option<Self> {
		if !Path::new(&path).exists() {
			let keychain = Self::random();
			create_dir_all(Path::new(&path).parent().expect("Unable to get parent directory")).expect("Unable to create directories");
			let mut file = OpenOptions::new().create(true).write(true).open(&path).expect("Unable to open node config file");
			let data = serde_json::to_string_pretty(&keychain).expect("Unable to serialize");
			file.write_all(data.as_bytes()).expect("Unable to write to file");
			Some(keychain)
		} else {
			None
		}
	}
}