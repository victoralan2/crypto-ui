use std::collections::HashSet;
use serde::{Deserialize, Serialize};
use crate::core::Hashable;
use crate::core::utxo::{Input, Output};
use crate::crypto::public_key::{PublicKeyAlgorithm, PublicKeyError};

#[derive(Clone, Deserialize, Serialize)]
pub struct Transaction {
	pub id: [u8; 32],
	pub input_list: Vec<Input>,
	pub output_list: Vec<Output>,
}

impl Transaction {
	pub fn create_transaction(inputs: Vec<Input>, outputs: Vec<Output>) -> Self {
		let mut s = Self {
			id: [0u8; 32],
			input_list: inputs,
			output_list: outputs,
		};
		s.update_hash();
		s
	}
	pub fn sign_inputs(&mut self, sk: &[u8]) -> Result<(), PublicKeyError> {
		for input in self.input_list.iter_mut() {
			let hash = input.calculate_hash();
			let signature = PublicKeyAlgorithm::sign(&sk, &hash)?;
			input.signature = signature;
		}
		Ok(())
	}
	pub fn verify_input_signatures(&self) -> bool {
		for input in &self.input_list {
			if !input.verify_signature() {
				return false;
			}
		}
		true
	}
	pub fn is_valid_heuristic(&self) -> bool {
		let is_tx_size_valid = self.input_list.len() < 128 && self.output_list.len() < 128;
		let are_inputs_unique = self.are_inputs_unique();
		let are_signatures_valid = self.verify_input_signatures();
		are_signatures_valid && are_inputs_unique && is_tx_size_valid
	}
	pub fn are_inputs_unique(&self) -> bool {
		let mut output_indexes = HashSet::new();
		for input in &self.input_list {
			if !output_indexes.insert(input.calculate_hash()) {
				return false;
			}
		}
		true
	}
	pub fn size(&self) -> usize {
		0 // FIXME
	}
}