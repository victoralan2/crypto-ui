use serde::{Deserialize, Serialize};
use crate::core::address::P2PKHAddress;
use crate::crypto::hash::hash;
use crate::crypto::public_key::PublicKeyAlgorithm;

#[derive(Clone, Debug, Eq, Hash, Serialize, Deserialize, PartialEq)]
pub struct Input {
	pub prev_txid: [u8; 32],
	pub output_index: usize,
	pub signature: Vec<u8>,
	pub public_key: Vec<u8>,
}
#[derive(Clone, Copy, Debug, Eq, Hash, Serialize, Deserialize, PartialEq)]
pub struct Output {
	pub amount: u64,
	pub address: P2PKHAddress,
}
#[derive(Clone, Copy, Debug, Eq, Hash, Serialize, Deserialize, PartialEq)]
pub struct UTXO {
	pub txid: [u8; 32],
	pub output_index: usize,
	pub amount: u64,
	pub recipient_address: P2PKHAddress,
}
impl Output {
	pub fn calculate_hash(&self) -> [u8; 32] {
		let str = format!("{}.{}", hex::encode(self.address.address), self.amount);
		hash(str.as_bytes())
	}
}
impl Input {
	pub fn calculate_hash(&self) -> [u8; 32] {
		let str = format!("{}.{}.{}", hex::encode(self.prev_txid), self.output_index, hex::encode(&self.public_key));
		hash(str.as_bytes())
	}
	pub fn verify_signature(&self) -> bool {
		// TODO: Test code
		let hash = self.calculate_hash();
		let signature =  &self.signature;
		if PublicKeyAlgorithm::verify(&self.public_key, &hash, signature).is_ok() {
			return true;
		}
		false
	}
}