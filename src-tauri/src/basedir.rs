use std::string::ToString;

use lazy_static::lazy_static;
use std::sync::Mutex;
use tauri::api::path::{data_dir, home_dir};
use crate::COIN_NAME;

lazy_static! {
	static ref BASE_DIRECTORY: Mutex<String> = {
		Mutex::new(
			if cfg!(target_os = "windows") {
				format!("{}/{}-wallet/",
					data_dir()
					.expect("Unable to get config directory")
					.to_str()
					.unwrap(), 
					uppercase_first_letter(&COIN_NAME
						.to_lowercase()
					)) // AppData/Roaming/**
			} else if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
								format!("{}/.{}-wallet/",
					home_dir()
					.expect("Unable to get home directory")
					.to_str()
					.unwrap(), 
					uppercase_first_letter(&COIN_NAME
						.to_lowercase()
					))
			} else {
				format!("{}/{}-wallet/",
					data_dir()
					.expect("Unable to get data directory")
					.to_str()
					.unwrap(), 
					uppercase_first_letter(&COIN_NAME
						.to_lowercase()
					))
			}
		)
	};
}
pub struct BaseDirectory;
impl BaseDirectory {
	pub fn get_base_directory() -> String {
		let lock = BASE_DIRECTORY.lock().unwrap();
		lock.clone()
	}

	pub fn set_base_directory(new_basedir: &str) {
		let mut mut_lock = BASE_DIRECTORY.lock().unwrap();
		*mut_lock = new_basedir.to_string();
	}
}
fn uppercase_first_letter(s: &str) -> String {
	let mut c = s.chars();
	match c.next() {
		None => String::new(),
		Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
	}
}