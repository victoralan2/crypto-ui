use crate::core::transaction::Transaction;
use crate::crypto::hash::hash;
use crate::crypto::hash::merkle::calculate_merkle_root;

pub mod address;
pub mod utxo;
pub mod transaction;

pub trait Hashable {
	fn calculate_hash(&self) -> [u8; 32];
	fn update_hash(&mut self);
}

impl Hashable for Transaction {
	/// IMPORTANT
	/// CHECK VALIDITY OF DATA BEFORE CALCULATING HASH. HASH DOES NOT CHECK FOR ERRORS IN COHERENCE
	fn calculate_hash(&self) -> [u8; 32] {
		let input_hash_list = self.input_list.iter().map(|x|x.calculate_hash()).collect();
		let inputs = hex::encode(calculate_merkle_root(input_hash_list));

		let output_hash_list = self.output_list.iter().map(|x|x.calculate_hash()).collect();
		let outputs = hex::encode(calculate_merkle_root(output_hash_list));

		let str = format!("{}.{}", inputs, outputs);
		hash(str.as_bytes())
	}
	fn update_hash(&mut self) {
		self.id = self.calculate_hash();
	}
}