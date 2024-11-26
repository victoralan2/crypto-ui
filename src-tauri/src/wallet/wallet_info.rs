use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Clone)]
pub struct WalletInfo {
	pub balance: u64,
	pub resonance_sent: i64,
	pub wallet_creation_second: u64,
}