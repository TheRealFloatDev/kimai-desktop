use tauri::State;

use crate::commands::auth::get_client;
use crate::kimai::client::{TimesheetCollectionExpanded, TimesheetEditForm, TimesheetFilterParams};
use crate::state::AppState;

#[tauri::command]
pub async fn list_timesheets(
    state: State<'_, AppState>,
    page: Option<i32>,
    size: Option<i32>,
    begin: Option<String>,
    end: Option<String>,
    customer: Option<i64>,
    project: Option<i64>,
    activity: Option<i64>,
    order_by: Option<String>,
    order: Option<String>,
    term: Option<String>,
) -> Result<Vec<TimesheetCollectionExpanded>, String> {
    let client = get_client(&state).await?;
    let params = TimesheetFilterParams {
        page,
        size,
        begin,
        end,
        customer,
        project,
        activity,
        order_by,
        order,
        term,
    };
    client.list_timesheets(params).await
}

#[tauri::command]
pub async fn update_timesheet(
    state: State<'_, AppState>,
    id: i64,
    form: TimesheetEditForm,
) -> Result<crate::kimai::client::TimesheetEntity, String> {
    let client = get_client(&state).await?;
    client.update_timesheet(id, form).await
}

#[tauri::command]
pub async fn delete_timesheet(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    let client = get_client(&state).await?;
    client.delete_timesheet(id).await
}
