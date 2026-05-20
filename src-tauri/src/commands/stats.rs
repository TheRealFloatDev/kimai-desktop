use chrono::{Datelike, Duration, Local, TimeZone};
use serde::Serialize;
use tauri::State;

use crate::commands::auth::get_client;
use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
pub struct WorkingStats {
    pub today_seconds: i64,
    pub week_seconds: i64,
    pub month_seconds: i64,
    pub year_seconds: i64,
}

fn month_begin() -> String {
    let now = Local::now();
    format!("{}-{:02}-01T00:00:00", now.year(), now.month())
}

fn year_begin() -> String {
    let now = Local::now();
    format!("{}-01-01T00:00:00", now.year())
}

fn week_begin() -> String {
    let now = Local::now();
    let days_from_monday = now.weekday().num_days_from_monday() as i64;
    let monday = now.date_naive() - Duration::days(days_from_monday);
    let start = Local
        .from_local_datetime(&monday.and_hms_opt(0, 0, 0).unwrap())
        .latest()
        .unwrap();
    start.format("%Y-%m-%dT%H:%M:%S").to_string()
}

fn sum_duration(entries: &[crate::kimai::client::TimesheetCollectionExpanded]) -> i64 {
    entries.iter().filter_map(|e| e.duration).sum()
}

#[tauri::command]
pub async fn get_working_stats(state: State<'_, AppState>) -> Result<WorkingStats, String> {
    let client = get_client(&state).await?;

    let today = client.get_today_timesheets().await?;
    let today_seconds: i64 = today.iter().filter_map(|e| e.duration).sum();

    let week_entries = client
        .list_timesheets(crate::kimai::client::TimesheetFilterParams {
            begin: Some(week_begin()),
            size: Some(500),
            page: Some(1),
            ..Default::default()
        })
        .await?;
    let week_seconds = sum_duration(&week_entries);

    let month_entries = client
        .list_timesheets(crate::kimai::client::TimesheetFilterParams {
            begin: Some(month_begin()),
            size: Some(500),
            page: Some(1),
            ..Default::default()
        })
        .await?;
    let month_seconds = sum_duration(&month_entries);

    let year_entries = client
        .list_timesheets(crate::kimai::client::TimesheetFilterParams {
            begin: Some(year_begin()),
            size: Some(500),
            page: Some(1),
            ..Default::default()
        })
        .await?;
    let year_seconds = sum_duration(&year_entries);

    Ok(WorkingStats {
        today_seconds,
        week_seconds,
        month_seconds,
        year_seconds,
    })
}
