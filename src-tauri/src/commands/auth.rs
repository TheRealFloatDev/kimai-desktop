use tauri::State;

use crate::credentials::{clear_credentials, load_credentials, save_credentials, CredentialsResponse};
use crate::kimai::client::{Credentials, KimaiClient, UserEntity};
use crate::state::AppState;

fn set_client(state: &State<AppState>, client: KimaiClient) {
    let mut guard = state.kimai_client.lock().unwrap();
    *guard = Some(client);
}

pub async fn get_client(state: &State<'_, AppState>) -> Result<KimaiClient, String> {
    let guard = state.kimai_client.lock().unwrap();
    guard
        .clone()
        .ok_or_else(|| "Nicht verbunden. Bitte API-Zugangsdaten einrichten.".to_string())
}

#[tauri::command]
pub async fn set_credentials(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    url: String,
    token: String,
) -> Result<(), String> {
    let creds = Credentials {
        url: crate::kimai::client::normalize_base_url(&url),
        token: token.trim().to_string(),
    };
    let client = KimaiClient::new(creds.url.clone(), creds.token.clone())?;
    client.validate().await?;
    save_credentials(&app, &creds)?;
    set_client(&state, client);
    Ok(())
}

#[tauri::command]
pub async fn get_credentials(app: tauri::AppHandle) -> Result<Option<CredentialsResponse>, String> {
    let creds = load_credentials(&app)?;
    Ok(creds.map(|c| CredentialsResponse {
        url: c.url,
        token: c.token,
    }))
}

#[tauri::command]
pub async fn validate_connection(
    url: String,
    token: String,
) -> Result<UserEntity, String> {
    let client = KimaiClient::new(url, token)?;
    client.validate().await
}

#[tauri::command]
pub async fn validate_stored_connection(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<UserEntity, String> {
    if let Some(creds) = load_credentials(&app)? {
        let client = KimaiClient::new(creds.url, creds.token)?;
        let user = client.validate().await?;
        set_client(&state, client);
        return Ok(user);
    }
    Err("Keine gespeicherten Zugangsdaten".to_string())
}

#[tauri::command]
pub async fn clear_stored_credentials(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    clear_credentials(&app)?;
    let mut guard = state.kimai_client.lock().unwrap();
    *guard = None;
    Ok(())
}

#[tauri::command]
pub async fn get_me(state: State<'_, AppState>) -> Result<UserEntity, String> {
    let client = get_client(&state).await?;
    client.validate().await
}
