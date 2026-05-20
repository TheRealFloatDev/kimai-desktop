use tauri::AppHandle;

/// macOS: Dock-Icon nur anzeigen, wenn das Hauptfenster sichtbar ist.
pub fn set_dock_visible(app: &AppHandle, visible: bool) {
    #[cfg(target_os = "macos")]
    {
        use tauri::ActivationPolicy;
        let policy = if visible {
            ActivationPolicy::Regular
        } else {
            ActivationPolicy::Accessory
        };
        let _ = app.set_activation_policy(policy);
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (app, visible);
    }
}
