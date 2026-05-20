use chrono::{DateTime, Utc};
use tauri::State;

use crate::commands::auth::get_client;
use crate::kimai::client::{TimesheetCollectionExpanded, TimesheetEditForm};
use crate::state::AppState;

#[tauri::command]
pub async fn start_timer(
    state: State<'_, AppState>,
    project_id: i64,
    activity_id: i64,
    description: Option<String>,
    tags: Option<String>,
    billable: Option<bool>,
) -> Result<crate::kimai::client::TimesheetEntity, String> {
    let client = get_client(&state).await?;

    // Kimai may error if another timer is already running — stop it first.
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
        description: description.filter(|s| !s.trim().is_empty()),
        tags: tags.filter(|s| !s.trim().is_empty()),
        billable,
        exported: None,
    };
    client.start_timer(form).await
}

#[tauri::command]
pub async fn restart_timer(
    state: State<'_, AppState>,
    id: i64,
) -> Result<crate::kimai::client::TimesheetEntity, String> {
    let client = get_client(&state).await?;
    client.restart_timesheet(id).await
}

#[tauri::command]
pub async fn stop_timer(
    state: State<'_, AppState>,
    id: i64,
) -> Result<crate::kimai::client::TimesheetEntity, String> {
    let client = get_client(&state).await?;
    client.stop_timer(id).await
}

#[tauri::command]
pub async fn get_active_timer(
    state: State<'_, AppState>,
) -> Result<Option<TimesheetCollectionExpanded>, String> {
    let client = get_client(&state).await?;
    let active = client.get_active_timesheet().await?;
    Ok(active.into_iter().next())
}

#[tauri::command]
pub async fn get_active_timer_duration(state: State<'_, AppState>) -> Result<Option<i64>, String> {
    let client = get_client(&state).await?;
    let active = client.get_active_timesheet().await?;
    let Some(timer) = active.into_iter().next() else {
        return Ok(None);
    };
    let begin: DateTime<Utc> = timer
        .begin
        .parse()
        .map_err(|e| format!("Ungültiges Datum: {}", e))?;
    let secs = (Utc::now() - begin).num_seconds();
    Ok(Some(secs.max(0)))
}

#[tauri::command]
pub async fn get_recent(
    state: State<'_, AppState>,
    size: Option<i32>,
) -> Result<Vec<TimesheetCollectionExpanded>, String> {
    let client = get_client(&state).await?;
    client.get_recent(size).await
}

#[tauri::command]
pub async fn get_today_timesheets(
    state: State<'_, AppState>,
) -> Result<Vec<TimesheetCollectionExpanded>, String> {
    let client = get_client(&state).await?;
    client.get_today_timesheets().await
}
