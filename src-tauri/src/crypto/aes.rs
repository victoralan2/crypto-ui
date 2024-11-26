use aes_gcm::{AeadCore, Aes256Gcm, Key, KeyInit, Nonce}; // Or `Aes128Gcm`
use ring::pbkdf2::*;
use rand::Rng;
use std::num::NonZeroU32;
use aes_gcm::aead::Aead;
use rand_core::OsRng;
use crate::crypto::hash::sha256;

const SALT_LEN: usize = 16;
const PBKDF2_ITERATIONS: NonZeroU32 = unsafe { NonZeroU32::new_unchecked(100_000) };

pub fn encrypt_data(password: &str, data: &[u8]) -> (Vec<u8>, Vec<u8>, Vec<u8>) {
	// Generate a random salt
	let salt: [u8; SALT_LEN] = rand::thread_rng().gen();

	// Derive key using PBKDF2
	let mut key = [0u8; 32]; // 256-bit key for AES-256
	derive(
		PBKDF2_HMAC_SHA256,
		PBKDF2_ITERATIONS,
		&salt,
		password.as_bytes(),
		&mut key,
	);

	let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 96-bits; unique per message
	// Create AES-GCM instance
	let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&key));

	// Encrypt the data
	let ciphertext = cipher
		.encrypt(Nonce::from_slice(&nonce), data)
		.expect("encryption failure!");

	// Return the encrypted data, salt, and nonce
	(ciphertext, salt.to_vec(), nonce.to_vec())
}

pub fn decrypt_data(password: &str, ciphertext: &[u8], salt: &[u8], nonce: &[u8]) -> Result<Vec<u8>, aes_gcm::Error> {
	// Derive key using PBKDF2
	let mut key = [0u8; 32];
	derive(
		PBKDF2_HMAC_SHA256,
		PBKDF2_ITERATIONS,
		salt,
		password.as_bytes(),
		&mut key,
	);

	// Create AES-GCM instance
	let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&key));

	// Attempt to decrypt
	cipher.decrypt(Nonce::from_slice(nonce), ciphertext)
}