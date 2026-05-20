use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

use crate::commands::auth::get_client;
use crate::credentials::load_credentials;
use crate::kimai::client::KimaiClient;
use crate::state::AppState;

pub const TRAY_ID: &str = "main";

pub fn format_duration(seconds: i64) -> String {
    let h = seconds / 3600;
    let m = (seconds % 3600) / 60;
    let s = seconds % 60;
    format!("{:02}:{:02}:{:02}", h, m, s)
}

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItem::with_id(app, "show", "Kimai anzeigen", true, None::<&str>)?;
    let start = MenuItem::with_id(app, "start", "Timer starten…", true, None::<&str>)?;
    let stop = MenuItem::with_id(app, "stop", "Timer stoppen", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Beenden", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let menu = Menu::with_items(app, &[&show, &separator, &start, &stop, &separator, &quit])?;

    let mut builder = TrayIconBuilder::with_id(TRAY_ID)
        .menu(&menu)
        .tooltip("Kimai Desktop");

    if let Some(icon) = app.default_window_icon().cloned() {
        builder = builder.icon(icon);
    }

    let _tray = builder
        .on_menu_event(|app, event| {
            handle_menu_click(app, event.id.as_ref());
        })
        .build(app)?;

    app.on_tray_icon_event(move |tray, event| {
        if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } = event
        {
            toggle_window(tray.app_handle());
        }
    });

    Ok(())
}

fn handle_menu_click(app: &AppHandle, id: &str) {
    match id {
        "show" => toggle_window(app),
        "start" => {
            show_window(app);
            let _ = app.emit("navigate", "/");
        }
        "stop" => {
            let app_clone = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = stop_active_timer(&app_clone).await {
                    eprintln!("Tray stop error: {}", e);
                }
            });
        }
        "quit" => app.exit(0),
        _ => {}
    }
}

fn toggle_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            show_window(app);
        }
    }
}

fn show_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

async fn stop_active_timer(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let client = get_client(&state).await?;
    let active = client.get_active_timesheet().await?;
    if let Some(timer) = active.into_iter().next() {
        client.stop_timer(timer.id).await?;
        update_tray_icon(app, None);
    }
    Ok(())
}

pub fn update_tray_icon(app: &AppHandle, duration_secs: Option<i64>) {
    let tooltip = match duration_secs {
        Some(s) => format!("{} – Timer läuft", format_duration(s)),
        None => "Kimai Desktop – Idle".to_string(),
    };

    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let _ = tray.set_tooltip(Some(&tooltip));

        #[cfg(target_os = "macos")]
        {
            let title = duration_secs
                .map(format_duration)
                .unwrap_or_default();
            let _ = tray.set_title(Some(&title));
        }
    }
}

static TRAY_LOOP_RUNNING: AtomicBool = AtomicBool::new(false);

pub fn start_tray_update_loop(app: AppHandle) {
    if TRAY_LOOP_RUNNING.swap(true, Ordering::SeqCst) {
        return;
    }

    tauri::async_runtime::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(2)).await;

            let duration = if load_credentials(&app).ok().flatten().is_some() {
                let state = app.state::<AppState>();
                {
                    let guard = state.kimai_client.lock().unwrap();
                    if guard.is_none() {
                        drop(guard);
                        if let Some(c) = load_credentials(&app).ok().flatten() {
                            if let Ok(client) = KimaiClient::new(c.url, c.token) {
                                *state.kimai_client.lock().unwrap() = Some(client);
                            }
                        }
                    }
                }
                if let Ok(client) = get_client(&app.state::<AppState>()).await {
                    if let Ok(active) = client.get_active_timesheet().await {
                        if let Some(timer) = active.into_iter().next() {
                            if let Ok(parsed) =
                                timer.begin.parse::<chrono::DateTime<chrono::Utc>>()
                            {
                                let secs = (chrono::Utc::now() - parsed).num_seconds();
                                Some(secs.max(0))
                            } else {
                                None
                            }
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                } else {
                    None
                }
            } else {
                None
            };

            update_tray_icon(&app, duration);
        }
    });
}
