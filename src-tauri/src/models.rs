use serde::{Deserialize, Serialize};
use crate::core::address::P2PKHAddress;
use crate::core::transaction::Transaction;
use crate::core::utxo::UTXO;

#[derive(Clone, Deserialize, Serialize)]
pub struct GetUTXOs {
	pub(crate) version: u32,
	pub(crate) address: P2PKHAddress,
}
#[derive(Clone, Deserialize, Serialize)]
pub struct UTXOs {
	pub(crate) version: u32,
	pub(crate) utxos: Vec<UTXO>,
}
#[derive(Clone, Deserialize, Serialize)]
pub struct NewTransaction {
	pub(crate) version: u32,
	pub(crate) transaction: Transaction,
}