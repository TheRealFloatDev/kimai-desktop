use tauri::State;

use crate::commands::auth::get_client;
use crate::kimai::client::{ActivityCollection, CustomerCollection, ProjectCollection};
use crate::state::AppState;

#[tauri::command]
pub async fn get_customers(state: State<'_, AppState>) -> Result<Vec<CustomerCollection>, String> {
    let client = get_client(&state).await?;
    client.get_customers().await
}

#[tauri::command]
pub async fn get_projects(
    state: State<'_, AppState>,
    customer_id: Option<i64>,
) -> Result<Vec<ProjectCollection>, String> {
    let client = get_client(&state).await?;
    client.get_projects(customer_id).await
}

#[tauri::command]
pub async fn get_activities(
    state: State<'_, AppState>,
    project_id: Option<i64>,
) -> Result<Vec<ActivityCollection>, String> {
    let client = get_client(&state).await?;
    client.get_activities(project_id).await
}
