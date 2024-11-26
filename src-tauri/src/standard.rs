use serde::{Deserialize};
use serde::de::DeserializeOwned;

pub(crate) const DATA_TYPE: &str = "application/json"; // TODO CHANGE THIS AT "application/octet-stream" WHEN NOT TESTING

// // Function to serialize the struct to a vector of bytes
// pub fn standard_serialize<T>(data: &T) -> Vec<u8>
// where T: serde::Serialize {
// 	json_serialize(data)
// }
//
// // Function to serialize the struct to a vector of bytes
// pub fn standard_deserialize<T>(data: &[u8]) -> T
// where T: DeserializeOwned {
// 	json_deserialize(data)
// }

// Function to serialize the struct to a vector of bytes
pub fn standard_serialize<T>(data: &T) -> Vec<u8>
	where T: serde::Serialize {
	json_serialize(data)
}

// Function to serialize the struct to a vector of bytes
pub fn standard_deserialize<T>(data: &[u8]) -> anyhow::Result<T, String>
	where T: DeserializeOwned {
	json_deserialize(data)
}

// Function to serialize the struct to a vector of bytes
fn bincode_serialize<T>(data: &T) -> Vec<u8>
	where T: serde::Serialize {
	bincode::serialize(data).expect("Failed to serialize")
}
// Function to deserialize a vector of bytes back to the struct
fn bincode_deserialize<'a, T>(data: &'a [u8]) -> T
	where T: DeserializeOwned {
	bincode::deserialize::<'a, T>(data).expect("Failed to deserialize")
}
// Function to serialize the struct to a vector of bytes
fn json_serialize<T>(data: &T) -> Vec<u8>
	where T: serde::Serialize {
	serde_json::to_vec(data).expect("Failed to serialize")
}

// Function to deserialize a vector of bytes back to the struct
fn json_deserialize<T>(data: &[u8]) -> anyhow::Result<T, String>
	where T: DeserializeOwned {
	serde_json::from_slice(data).map_err(|e| e.to_string())
}