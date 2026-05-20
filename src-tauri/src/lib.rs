mod commands;
mod credentials;
mod i18n;
mod kimai;
mod macos_dock;
mod preferences;
mod state;
mod timer_display;
mod tray;

use commands::{
    clear_stored_credentials, clear_timer_display_anchor, delete_timesheet, get_active_timer,
    create_tag, get_activities, get_app_preferences, get_credentials, get_customers, get_me,
    get_projects, get_tags,
    get_recent, get_timer_display_seconds, get_today_timesheets, get_working_stats,
    list_timesheets, reset_timer_display_anchor, restart_timer, set_app_locale,
    set_autostart_enabled, set_credentials, start_timer, stop_timer, update_timesheet,
    validate_connection, validate_stored_connection,
};
use preferences::load_preferences;
use state::AppState;
use tauri::{Manager, RunEvent, WindowEvent};
use tray::{hide_main_window, setup_tray, show_window, start_tray_update_loop};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_window(app);
        }));
    }

    builder
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
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
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
            get_timer_display_seconds,
            reset_timer_display_anchor,
            clear_timer_display_anchor,
            get_recent,
            get_today_timesheets,
            get_working_stats,
            list_timesheets,
            update_timesheet,
            delete_timesheet,
            get_customers,
            get_projects,
            get_activities,
            get_tags,
            create_tag,
            get_app_preferences,
            set_app_locale,
            set_autostart_enabled,
        ])
        .on_window_event(|window, event| {
            if window.label() != "main" {
                return;
            }
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                hide_main_window(window.app_handle());
            }
        })
        .setup(|app| {
            if let Ok(prefs) = load_preferences(&app.handle()) {
                *app.state::<AppState>().locale.lock().unwrap() = prefs.locale.clone();
                use tauri_plugin_autostart::ManagerExt;
                let autostart = app.handle().autolaunch();
                if prefs.autostart {
                    let _ = autostart.enable();
                } else {
                    let _ = autostart.disable();
                }
            }
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
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            match event {
                RunEvent::ExitRequested { api, .. } => {
                    // Fenster schließen / Cmd+Q: App im Hintergrund behalten.
                    // Tray „Beenden“ setzt quit_requested und beendet wirklich.
                    if !app_handle.state::<AppState>().is_quit_requested() {
                        api.prevent_exit();
                    }
                }
                RunEvent::Reopen { .. } => {
                    // macOS: Dock-Icon angeklickt → Fenster wieder anzeigen.
                    show_window(app_handle);
                }
                _ => {}
            }
        });
}
