use std::sync::Mutex;

use crate::kimai::client::KimaiClient;

#[derive(Default)]
pub struct AppState {
    pub kimai_client: Mutex<Option<KimaiClient>>,
}
