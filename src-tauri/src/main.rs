#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::async_runtime::Mutex;
use tauri::Manager;
use crate::tauri_commands::*;
use crate::wallet::Wallet;

pub mod core;
pub mod crypto;
mod tauri_commands;
mod standard;
mod basedir;
pub mod wallet;
pub mod routes;
mod models;

pub const COIN_NAME: &str = "RESONANCE";
pub const COIN_NAME_ABBREVIATION: &str = "RSN";


#[derive(Clone)]
pub struct AppState {
    pub wallet: Option<Wallet>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            wallet: Default::default(),
        }
    }
}
fn main() {
        tauri::Builder::default()
            .setup(|a| {
                a.manage(Mutex::new(AppState::default()));
                Ok(())
            })
            .invoke_handler(tauri::generate_handler![is_valid_address, create_transaction, get_wallet_info, get_available_wallet_names, is_wallet_loaded, try_load_wallet, create_new_wallet, get_wallet_address, test, save_wallet_to_file, is_valid_url])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
}
