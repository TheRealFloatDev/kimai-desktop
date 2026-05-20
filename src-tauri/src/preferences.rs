use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

const PREFERENCES_FILE: &str = "preferences.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppPreferences {
    #[serde(default = "default_locale")]
    pub locale: String,
    #[serde(default)]
    pub autostart: bool,
}

fn default_locale() -> String {
    "en".to_string()
}

impl Default for AppPreferences {
    fn default() -> Self {
        Self {
            locale: default_locale(),
            autostart: false,
        }
    }
}

fn preferences_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join(PREFERENCES_FILE))
}

pub fn load_preferences(app: &tauri::AppHandle) -> Result<AppPreferences, String> {
    let path = preferences_path(app)?;
    if !path.exists() {
        return Ok(AppPreferences::default());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

pub fn save_preferences(app: &tauri::AppHandle, prefs: &AppPreferences) -> Result<(), String> {
    let path = preferences_path(app)?;
    let data = serde_json::to_string_pretty(prefs).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())
}
