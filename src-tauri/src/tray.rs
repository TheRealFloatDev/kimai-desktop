use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

use crate::commands::auth::get_client;
use crate::credentials::load_credentials;
use crate::i18n;
use crate::kimai::client::{KimaiClient, TimesheetEditForm};
use crate::macos_dock::set_dock_visible;
use crate::state::{AppState, TrayRecentEntry, TraySnapshot, TrayStartEntry};
use crate::timer_display::{
    clear_display_anchor, display_elapsed_secs, format_display_duration, reset_display_anchor_now,
};

pub const TRAY_ID: &str = "main";

fn refresh_tray_menu_if_needed(app: &AppHandle, snapshot: &TraySnapshot) {
    let fp = snapshot.menu_fingerprint();
    let state = app.state::<AppState>();
    let mut last = state.tray_menu_fingerprint.lock().unwrap();
    if *last == fp {
        return;
    }
    *last = fp;
    drop(last);

    if let Ok(menu) = build_tray_menu(app, snapshot) {
        if let Some(tray) = app.tray_by_id(TRAY_ID) {
            let _ = tray.set_menu(Some(menu));
        }
    }
}

fn tray_icon() -> tauri::image::Image<'static> {
    tauri::image::Image::from_bytes(include_bytes!("../icons/tray-icon.png"))
        .expect("tray icon png")
}

fn current_locale(app: &AppHandle) -> String {
    app.state::<AppState>().locale.lock().unwrap().clone()
}

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let locale = current_locale(app);
    let mut builder = TrayIconBuilder::with_id(TRAY_ID)
        .tooltip(&i18n::t(&locale, "tray.tooltipIdle"))
        .icon(tray_icon());

    let menu = build_tray_menu(app, &TraySnapshot::default())?;
    builder = builder.menu(&menu);

    let _tray = builder
        .on_menu_event(|app, event| {
            handle_menu_click(app, event.id.as_ref());
        })
        .build(app)?;

    if let Ok(menu) = build_tray_menu(app, &TraySnapshot::default()) {
        if let Some(tray) = app.tray_by_id(TRAY_ID) {
            let _ = tray.set_menu(Some(menu));
            *app.state::<AppState>()
                .tray_menu_fingerprint
                .lock()
                .unwrap() = 0;
        }
    }

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

fn build_tray_menu(
    app: &AppHandle,
    snapshot: &TraySnapshot,
) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
    let locale = current_locale(app);
    let show = MenuItem::with_id(
        app,
        "show",
        &i18n::t(&locale, "tray.show"),
        true,
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(
        app,
        "quit",
        &i18n::t(&locale, "tray.quit"),
        true,
        None::<&str>,
    )?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let sep3 = PredefinedMenuItem::separator(app)?;

    let mut owned_items: Vec<MenuItem<tauri::Wry>> = Vec::new();
    let mut owned_submenus: Vec<Submenu<tauri::Wry>> = Vec::new();
    let show_item = show;
    let mut recent_indices = Vec::new();
    let mut stop_index: Option<usize> = None;
    let mut open_index: Option<usize> = None;

    owned_items.push(show_item);

    if let Some(active_id) = snapshot.active_timer_id {
        owned_items.push(MenuItem::with_id(
            app,
            format!("stop-{}", active_id),
            &i18n::t(&locale, "tray.stop"),
            true,
            None::<&str>,
        )?);
        stop_index = Some(owned_items.len() - 1);
    } else {
        for recent in snapshot.recents.iter().take(5) {
            owned_items.push(MenuItem::with_id(
                app,
                format!("recent-{}", recent.timesheet_id),
                truncate_label(&recent.label, 48),
                true,
                None::<&str>,
            )?);
            recent_indices.push(owned_items.len() - 1);
        }
        open_index = build_start_section(app, snapshot, &mut owned_items, &mut owned_submenus)?;
    }

    let mut top: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = vec![&owned_items[0]];

    if let Some(si) = stop_index {
        top.push(&sep1);
        top.push(&owned_items[si]);
    } else {
        if !recent_indices.is_empty() {
            top.push(&sep1);
            for i in recent_indices {
                top.push(&owned_items[i]);
            }
        }
        if let Some(oi) = open_index {
            top.push(&sep2);
            top.push(&owned_items[oi]);
            if let Some(sub) = owned_submenus.last() {
                top.push(sub);
            }
        }
    }

    top.push(&sep3);
    top.push(&quit);

    Ok(Menu::with_items(app, &top)?)
}

/// Returns index of "open-start" menu item if a start section was added.
fn build_start_section(
    app: &AppHandle,
    snapshot: &TraySnapshot,
    owned_items: &mut Vec<MenuItem<tauri::Wry>>,
    owned_submenus: &mut Vec<Submenu<tauri::Wry>>,
) -> Result<Option<usize>, Box<dyn std::error::Error>> {
    if snapshot.start_entries.is_empty() && snapshot.recents.is_empty() {
        return Ok(None);
    }

    let locale = current_locale(app);
    owned_items.push(MenuItem::with_id(
        app,
        "open-start",
        &i18n::t(&locale, "tray.openPicker"),
        true,
        None::<&str>,
    )?);
    let open_idx = owned_items.len() - 1;

    if snapshot.start_entries.is_empty() {
        return Ok(Some(open_idx));
    }

    // customer -> project -> [activity menu items]
    let mut tree: std::collections::BTreeMap<
        String,
        std::collections::BTreeMap<String, Vec<&TrayStartEntry>>,
    > = std::collections::BTreeMap::new();

    for entry in &snapshot.start_entries {
        let parts: Vec<&str> = entry.label.split(" · ").collect();
        let customer = parts.first().copied().unwrap_or("Sonstige").to_string();
        let project = parts.get(1).copied().unwrap_or("Projekt").to_string();
        tree.entry(customer)
            .or_default()
            .entry(project)
            .or_default()
            .push(entry);
    }

    let mut customer_subs: Vec<Submenu<tauri::Wry>> = Vec::new();
    for (ci, (customer_name, projects)) in tree.iter().take(8).enumerate() {
        let mut project_subs: Vec<Submenu<tauri::Wry>> = Vec::new();
        for (pi, (project_name, entries)) in projects.iter().take(6).enumerate() {
            let mut act_items: Vec<MenuItem<tauri::Wry>> = Vec::new();
            for entry in entries.iter().take(12) {
                let act_name = entry.label.split(" · ").last().unwrap_or(&entry.label);
                act_items.push(MenuItem::with_id(
                    app,
                    format!("start-{}-{}", entry.project_id, entry.activity_id),
                    truncate_label(act_name, 40),
                    true,
                    None::<&str>,
                )?);
            }
            if act_items.is_empty() {
                continue;
            }
            let refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = act_items
                .iter()
                .map(|i| i as &dyn tauri::menu::IsMenuItem<tauri::Wry>)
                .collect();
            let sub = Submenu::with_id_and_items(
                app,
                format!("tray-proj-{ci}-{pi}"),
                truncate_label(project_name, 32),
                true,
                &refs,
            )?;
            owned_items.extend(act_items);
            project_subs.push(sub);
        }
        if project_subs.is_empty() {
            continue;
        }
        let refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = project_subs
            .iter()
            .map(|s| s as &dyn tauri::menu::IsMenuItem<tauri::Wry>)
            .collect();
        let cust = Submenu::with_id_and_items(
            app,
            format!("tray-cust-{ci}"),
            truncate_label(customer_name, 32),
            true,
            &refs,
        )?;
        owned_submenus.extend(project_subs);
        customer_subs.push(cust);
    }

    if !customer_subs.is_empty() {
        let refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = customer_subs
            .iter()
            .map(|s| s as &dyn tauri::menu::IsMenuItem<tauri::Wry>)
            .collect();
        let root = Submenu::with_id_and_items(
            app,
            "new-timer",
            &i18n::t(&locale, "tray.newTimer"),
            true,
            &refs,
        )?;
        owned_submenus.extend(customer_subs);
        owned_submenus.push(root);
    }

    Ok(Some(open_idx))
}

fn truncate_label(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        s.to_string()
    } else {
        format!(
            "{}…",
            s.chars().take(max.saturating_sub(1)).collect::<String>()
        )
    }
}

async fn refresh_tray_snapshot(app: &AppHandle) -> TraySnapshot {
    let mut snapshot = TraySnapshot::default();

    let Ok(client) = get_client(&app.state::<AppState>()).await else {
        return snapshot;
    };

    if let Ok(active) = client.get_active_timesheet().await {
        if let Some(timer) = active.into_iter().next() {
            snapshot.active_timer_id = Some(timer.id);
            snapshot.duration_secs = Some(display_elapsed_secs(
                &app.state::<AppState>(),
                timer.id,
                &timer.begin,
            ));
        } else {
            snapshot.active_timer_id = None;
            snapshot.duration_secs = None;
            clear_display_anchor(&app.state::<AppState>());
        }
    }

    if snapshot.active_timer_id.is_none() {
        if let Ok(recents) = client.get_recent(Some(5)).await {
            snapshot.recents = recents
                .into_iter()
                .map(|r| {
                    let customer = r
                        .project
                        .customer
                        .as_ref()
                        .map(|c| c.name.as_str())
                        .unwrap_or("?");
                    TrayRecentEntry {
                        timesheet_id: r.id,
                        project_id: r.project.id,
                        activity_id: r.activity.id,
                        label: format!("{} · {} · {}", customer, r.project.name, r.activity.name),
                    }
                })
                .collect();
        }

        if let Ok(customers) = client.get_customers().await {
            for customer in customers.iter().take(6) {
                let Ok(projects) = client.get_projects(Some(customer.id)).await else {
                    continue;
                };
                for project in projects.iter().take(4) {
                    let Ok(activities) = client.get_activities(Some(project.id)).await else {
                        continue;
                    };
                    for activity in activities.iter().take(8) {
                        snapshot.start_entries.push(TrayStartEntry {
                            project_id: project.id,
                            activity_id: activity.id,
                            label: format!(
                                "{} · {} · {}",
                                customer.name, project.name, activity.name
                            ),
                        });
                    }
                }
            }
        }
    }

    *app.state::<AppState>().tray_snapshot.lock().unwrap() = snapshot.clone();
    snapshot
}

fn handle_menu_click(app: &AppHandle, id: &str) {
    if id == "show" {
        toggle_window(app);
        return;
    }
    if id == "quit" {
        app.state::<AppState>().request_quit();
        app.exit(0);
        return;
    }
    if id == "open-start" {
        show_window(app);
        let _ = app.emit("navigate", "/");
        return;
    }
    if let Some(rest) = id.strip_prefix("stop-") {
        if let Ok(active_id) = rest.parse::<i64>() {
            let app_clone = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = stop_timer_by_id(&app_clone, active_id).await {
                    eprintln!("Tray stop error: {}", e);
                }
            });
        }
        return;
    }
    if let Some(ts_id) = id.strip_prefix("recent-") {
        if let Ok(id) = ts_id.parse::<i64>() {
            let app_clone = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = restart_from_tray(&app_clone, id).await {
                    eprintln!("Tray recent error: {}", e);
                }
            });
        }
        return;
    }
    if let Some(pair) = id.strip_prefix("start-") {
        let parts: Vec<&str> = pair.split('-').collect();
        if parts.len() == 2 {
            if let (Ok(project_id), Ok(activity_id)) =
                (parts[0].parse::<i64>(), parts[1].parse::<i64>())
            {
                let app_clone = app.clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = start_from_tray(&app_clone, project_id, activity_id).await {
                        eprintln!("Tray start error: {}", e);
                    }
                });
            }
        }
    }
}

async fn start_from_tray(app: &AppHandle, project_id: i64, activity_id: i64) -> Result<(), String> {
    let state = app.state::<AppState>();
    let client = get_client(&state).await?;
    if let Ok(active) = client.get_active_timesheet().await {
        if let Some(running) = active.into_iter().next() {
            client.stop_timer(running.id).await?;
        }
    }
    let form = TimesheetEditForm {
        begin: None,
        end: None,
        project: project_id,
        activity: activity_id,
        description: None,
        tags: None,
        billable: None,
        exported: None,
    };
    let entity = client.start_timer(form).await?;
    reset_display_anchor_now(&app.state::<AppState>(), Some(entity.id));
    let snapshot = refresh_tray_snapshot(app).await;
    *app.state::<AppState>()
        .tray_menu_fingerprint
        .lock()
        .unwrap() = 0;
    update_tray_icon(app, snapshot.duration_secs);
    refresh_tray_menu_if_needed(app, &snapshot);
    Ok(())
}

async fn restart_from_tray(app: &AppHandle, timesheet_id: i64) -> Result<(), String> {
    let state = app.state::<AppState>();
    let client = get_client(&state).await?;
    let entity = client.restart_timesheet(timesheet_id).await?;
    reset_display_anchor_now(&app.state::<AppState>(), Some(entity.id));
    let snapshot = refresh_tray_snapshot(app).await;
    *app.state::<AppState>()
        .tray_menu_fingerprint
        .lock()
        .unwrap() = 0;
    update_tray_icon(app, snapshot.duration_secs);
    refresh_tray_menu_if_needed(app, &snapshot);
    Ok(())
}

async fn stop_timer_by_id(app: &AppHandle, id: i64) -> Result<(), String> {
    let state = app.state::<AppState>();
    let client = get_client(&state).await?;
    client.stop_timer(id).await?;
    clear_display_anchor(&app.state::<AppState>());
    let snapshot = refresh_tray_snapshot(app).await;
    *app.state::<AppState>()
        .tray_menu_fingerprint
        .lock()
        .unwrap() = 0;
    update_tray_icon(app, snapshot.duration_secs);
    refresh_tray_menu_if_needed(app, &snapshot);
    Ok(())
}

fn toggle_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            hide_main_window(app);
        } else {
            show_window(app);
        }
    }
}

pub fn hide_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    set_dock_visible(app, false);
}

pub fn show_window(app: &AppHandle) {
    set_dock_visible(app, true);
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

pub fn update_tray_from_snapshot(app: &AppHandle) {
    let snapshot = app
        .state::<AppState>()
        .tray_snapshot
        .lock()
        .unwrap()
        .clone();
    update_tray_icon(app, snapshot.duration_secs);
    refresh_tray_menu_if_needed(app, &snapshot);
}

pub fn update_tray_icon(app: &AppHandle, duration_secs: Option<i64>) {
    let locale = current_locale(app);
    let tooltip = match duration_secs {
        Some(s) => i18n::t_fmt(&locale, "tray.tooltipRunning", &format_display_duration(s)),
        None => i18n::t(&locale, "tray.tooltipIdle"),
    };

    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let _ = tray.set_tooltip(Some(&tooltip));

        #[cfg(target_os = "macos")]
        {
            if let Some(secs) = duration_secs {
                let title = format_display_duration(secs);
                let _ = tray.set_title(Some(title.as_str()));
            } else {
                // Leerer Titel entfernt die Zeitanzeige neben dem Icon (nur Icon sichtbar).
                let _ = tray.set_title(Some(""));
            }
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
            if load_credentials(&app).ok().flatten().is_some() {
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

                if get_client(&app.state::<AppState>()).await.is_ok() {
                    let snapshot = refresh_tray_snapshot(&app).await;
                    update_tray_icon(&app, snapshot.duration_secs);
                    refresh_tray_menu_if_needed(&app, &snapshot);
                }
            } else {
                update_tray_icon(&app, None);
            }

            let sleep_secs = {
                let state = app.state::<AppState>();
                let snap = state.tray_snapshot.lock().unwrap();
                if snap.duration_secs.is_some() {
                    1
                } else {
                    2
                }
            };
            tokio::time::sleep(Duration::from_secs(sleep_secs)).await;
        }
    });
}
