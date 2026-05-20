use tauri::State;

use crate::commands::auth::get_client;
use crate::kimai::client::{TimesheetCollectionExpanded, TimesheetEditForm};
use crate::state::AppState;
use crate::timer_display::{clear_display_anchor, display_elapsed_secs, reset_display_anchor_now};

#[tauri::command]
pub async fn start_timer(
    state: State<'_, AppState>,
    project_id: i64,
    activity_id: i64,
    description: Option<String>,
    tags: Option<String>,
    billable: Option<bool>,
) -> Result<crate::kimai::client::TimesheetEntity, String> {
    reset_display_anchor_now(&state, None);
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
        description: description.filter(|s| !s.trim().is_empty()),
        tags: tags.filter(|s| !s.trim().is_empty()),
        billable,
        exported: None,
    };
    let entity = client.start_timer(form).await?;
    reset_display_anchor_now(&state, Some(entity.id));
    Ok(entity)
}

#[tauri::command]
pub async fn restart_timer(
    state: State<'_, AppState>,
    id: i64,
) -> Result<crate::kimai::client::TimesheetEntity, String> {
    reset_display_anchor_now(&state, None);
    let client = get_client(&state).await?;
    let entity = client.restart_timesheet(id).await?;
    reset_display_anchor_now(&state, Some(entity.id));
    Ok(entity)
}

#[tauri::command]
pub async fn stop_timer(
    state: State<'_, AppState>,
    id: i64,
) -> Result<crate::kimai::client::TimesheetEntity, String> {
    let client = get_client(&state).await?;
    let entity = client.stop_timer(id).await?;
    clear_display_anchor(&state);
    Ok(entity)
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
pub async fn get_timer_display_seconds(state: State<'_, AppState>) -> Result<Option<i64>, String> {
    let client = get_client(&state).await?;
    let active = client.get_active_timesheet().await?;
    let Some(timer) = active.into_iter().next() else {
        clear_display_anchor(&state);
        return Ok(None);
    };
    Ok(Some(display_elapsed_secs(&state, timer.id, &timer.begin)))
}

#[tauri::command]
pub async fn reset_timer_display_anchor(
    state: State<'_, AppState>,
    timer_id: Option<i64>,
) -> Result<(), String> {
    reset_display_anchor_now(&state, timer_id);
    Ok(())
}

#[tauri::command]
pub async fn clear_timer_display_anchor(state: State<'_, AppState>) -> Result<(), String> {
    clear_display_anchor(&state);
    Ok(())
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
