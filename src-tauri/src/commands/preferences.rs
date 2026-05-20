use tauri::State;

use crate::preferences::{load_preferences, save_preferences, AppPreferences};
use crate::state::AppState;

#[tauri::command]
pub async fn get_app_preferences(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<AppPreferences, String> {
    let prefs = load_preferences(&app)?;
    *state.locale.lock().unwrap() = prefs.locale.clone();
    Ok(prefs)
}

#[tauri::command]
pub async fn set_app_locale(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    locale: String,
) -> Result<(), String> {
    let mut prefs = load_preferences(&app)?;
    prefs.locale = locale.clone();
    save_preferences(&app, &prefs)?;
    *state.locale.lock().unwrap() = locale;
    *state.tray_menu_fingerprint.lock().unwrap() = 0;
    Ok(())
}

#[tauri::command]
pub async fn set_autostart_enabled(
    app: tauri::AppHandle,
    enabled: bool,
) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;

    let autostart = app.autolaunch();
    if enabled {
        autostart.enable().map_err(|e| e.to_string())?;
    } else {
        autostart.disable().map_err(|e| e.to_string())?;
    }

    let mut prefs = load_preferences(&app)?;
    prefs.autostart = enabled;
    save_preferences(&app, &prefs)?;
    Ok(())
}
