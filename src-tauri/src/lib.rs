mod commands;
mod credentials;
mod kimai;
mod state;
mod tray;

use commands::{
    clear_stored_credentials, delete_timesheet, get_active_timer, get_active_timer_duration,
    get_activities, get_credentials, get_customers, get_me, get_projects, get_recent,
    get_today_timesheets, get_working_stats, list_timesheets, restart_timer, set_credentials,
    start_timer, stop_timer,
    update_timesheet, validate_connection, validate_stored_connection,
};
use state::AppState;
use tauri::Manager;
use tray::{setup_tray, start_tray_update_loop};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_stronghold::Builder::new(|password| {
                use sha2::{Digest, Sha256};
                let mut hasher = Sha256::new();
                hasher.update(password.as_bytes());
                hasher.update(b"kimai-desktop-vault");
                hasher.finalize().to_vec()
            })
            .build(),
        )
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            set_credentials,
            get_credentials,
            validate_connection,
            validate_stored_connection,
            clear_stored_credentials,
            get_me,
            start_timer,
            restart_timer,
            stop_timer,
            get_active_timer,
            get_active_timer_duration,
            get_recent,
            get_today_timesheets,
            get_working_stats,
            list_timesheets,
            update_timesheet,
            delete_timesheet,
            get_customers,
            get_projects,
            get_activities,
        ])
        .setup(|app| {
            if let Ok(Some(creds)) = credentials::load_credentials(&app.handle()) {
                if let Ok(client) = kimai::KimaiClient::new(creds.url, creds.token) {
                    let state = app.state::<AppState>();
                    *state.kimai_client.lock().unwrap() = Some(client);
                }
            }
            setup_tray(&app.handle())?;
            start_tray_update_loop(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
