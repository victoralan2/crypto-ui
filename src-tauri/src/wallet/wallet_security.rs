use base58::ToBase58;
use serde::{Serialize, Deserialize};
use serde::de::DeserializeOwned;
use crate::crypto::aes::{decrypt_data, encrypt_data};
use crate::standard::{standard_deserialize, standard_serialize};

#[derive(Serialize, Deserialize)]
pub struct EncryptedObject {
	pub encrypted_data: Vec<u8>,
	pub salt: Vec<u8>,
	pub nonce: Vec<u8>,
}
impl EncryptedObject {
	pub fn load(bytes: Vec<u8>) -> Self {
		standard_deserialize(&bytes).unwrap()
	}
	pub fn serialize(&self) -> Vec<u8> {
		standard_serialize(&self)
	}
	pub fn decrypt_object<T>(&self, password: &str) -> Result<T, aes_gcm::Error>
	where
		T: DeserializeOwned,
	{
		let decrypted_data = decrypt_data(password, &self.encrypted_data, &self.salt, &self.nonce)?;
		let deserialized: T = standard_deserialize(&decrypted_data).unwrap();
		Ok(deserialized)
	}
	pub fn encrypt_object<T>(object: &T, password: &str) -> Self
	where
		T: Serialize,
	{
		let serialized_object = standard_serialize(object);
		let (encrypted_data, salt, nonce) = encrypt_data(password, &serialized_object);
		Self {
			encrypted_data,
			salt,
			nonce,
		}
	}
}