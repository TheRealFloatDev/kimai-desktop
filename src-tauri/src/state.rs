use std::sync::Mutex;

use crate::kimai::client::KimaiClient;

#[derive(Clone, Default)]
pub struct TrayRecentEntry {
    pub timesheet_id: i64,
    pub project_id: i64,
    pub activity_id: i64,
    pub label: String,
}

#[derive(Clone, Default)]
pub struct TrayStartEntry {
    pub project_id: i64,
    pub activity_id: i64,
    pub label: String,
}

#[derive(Clone, Default)]
pub struct TraySnapshot {
    pub active_timer_id: Option<i64>,
    pub duration_secs: Option<i64>,
    pub recents: Vec<TrayRecentEntry>,
    pub start_entries: Vec<TrayStartEntry>,
}

impl TraySnapshot {
    /// Hash of menu structure only (excludes duration).
    pub fn menu_fingerprint(&self) -> u64 {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        let mut h = DefaultHasher::new();
        self.active_timer_id.hash(&mut h);
        for r in &self.recents {
            r.timesheet_id.hash(&mut h);
        }
        self.start_entries.len().hash(&mut h);
        for e in &self.start_entries {
            e.project_id.hash(&mut h);
            e.activity_id.hash(&mut h);
        }
        h.finish()
    }
}

#[derive(Clone, Default)]
pub struct TimerDisplayAnchor {
    pub timer_id: Option<i64>,
    pub started_at_ms: i64,
}

#[derive(Default)]
pub struct AppState {
    pub kimai_client: Mutex<Option<KimaiClient>>,
    pub tray_snapshot: Mutex<TraySnapshot>,
    pub tray_menu_fingerprint: Mutex<u64>,
    pub timer_display_anchor: Mutex<TimerDisplayAnchor>,
}
