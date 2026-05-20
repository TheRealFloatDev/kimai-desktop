use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

use crate::kimai::client::Credentials;

const CREDENTIALS_FILE: &str = "credentials.json";

fn credentials_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join(CREDENTIALS_FILE))
}

pub fn load_credentials(app: &tauri::AppHandle) -> Result<Option<Credentials>, String> {
    let path = credentials_path(app)?;
    if !path.exists() {
        return Ok(None);
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let creds: Credentials = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(Some(creds))
}

pub fn save_credentials(app: &tauri::AppHandle, creds: &Credentials) -> Result<(), String> {
    let path = credentials_path(app)?;
    let data = serde_json::to_string(creds).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())
}

pub fn clear_credentials(app: &tauri::AppHandle) -> Result<(), String> {
    let path = credentials_path(app)?;
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialsResponse {
    pub url: String,
    pub token: String,
}
