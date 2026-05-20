use chrono::{Local, TimeZone, Utc};

use crate::state::{AppState, TimerDisplayAnchor};

/// Parses Kimai `begin` like the frontend `new Date(...)` (local when no offset).
pub fn parse_begin_to_utc_ms(begin: &str) -> Option<i64> {
    let trimmed = begin.trim();
    if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(trimmed) {
        return Some(dt.with_timezone(&Utc).timestamp_millis());
    }
    if let Ok(dt) = chrono::DateTime::parse_from_str(trimmed, "%Y-%m-%dT%H:%M:%S%#z") {
        return Some(dt.with_timezone(&Utc).timestamp_millis());
    }
    if let Ok(naive) = chrono::NaiveDateTime::parse_from_str(trimmed, "%Y-%m-%dT%H:%M:%S") {
        if let Some(local) = Local.from_local_datetime(&naive).latest() {
            return Some(local.with_timezone(&Utc).timestamp_millis());
        }
    }
    if trimmed.len() >= 19 {
        let naive_part = &trimmed[..19];
        if let Ok(naive) = chrono::NaiveDateTime::parse_from_str(naive_part, "%Y-%m-%dT%H:%M:%S") {
            if let Some(local) = Local.from_local_datetime(&naive).latest() {
                return Some(local.with_timezone(&Utc).timestamp_millis());
            }
        }
    }
    None
}

pub fn reset_display_anchor_now(state: &AppState, timer_id: Option<i64>) {
    let mut anchor = state.timer_display_anchor.lock().unwrap();
    anchor.timer_id = timer_id;
    anchor.started_at_ms = Utc::now().timestamp_millis();
}

pub fn clear_display_anchor(state: &AppState) {
    *state.timer_display_anchor.lock().unwrap() = TimerDisplayAnchor::default();
}

/// Elapsed seconds for tray + UI (single source of truth).
pub fn display_elapsed_secs(state: &AppState, timer_id: i64, begin: &str) -> i64 {
    let now_ms = Utc::now().timestamp_millis();
    let mut anchor = state.timer_display_anchor.lock().unwrap();

    let needs_bind = anchor.timer_id != Some(timer_id);
    if needs_bind {
        anchor.timer_id = Some(timer_id);
        anchor.started_at_ms = parse_begin_to_utc_ms(begin).unwrap_or(now_ms);
    }

    let elapsed = (now_ms - anchor.started_at_ms) / 1000;
    elapsed.max(0)
}

/// Same format as frontend `formatDuration` (HH:MM:SS).
pub fn format_display_duration(seconds: i64) -> String {
    let h = seconds / 3600;
    let m = (seconds % 3600) / 60;
    let s = seconds % 60;
    format!("{h:02}:{m:02}:{s:02}")
}
