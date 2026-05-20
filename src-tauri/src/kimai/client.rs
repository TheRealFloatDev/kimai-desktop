use chrono::Local;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credentials {
    pub url: String,
    pub token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserEntity {
    pub id: i64,
    pub username: String,
    pub title: Option<String>,
    pub alias: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerCollection {
    pub id: i64,
    pub name: String,
    pub visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectCollection {
    pub id: i64,
    pub name: String,
    pub customer: i64,
    pub visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagEntity {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityCollection {
    pub id: i64,
    pub name: String,
    pub project: Option<i64>,
    pub visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimesheetEditForm {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub begin: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<String>,
    pub project: i64,
    pub activity: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub billable: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exported: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimesheetEntity {
    pub id: i64,
    pub begin: String,
    pub end: Option<String>,
    pub duration: Option<i64>,
    pub project: i64,
    pub activity: i64,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub billable: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimesheetCollection {
    pub id: i64,
    pub begin: String,
    pub end: Option<String>,
    pub duration: Option<i64>,
    pub project: i64,
    pub activity: i64,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub rate: Option<f64>,
    pub billable: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerRef {
    pub id: i64,
    pub name: String,
    #[serde(default)]
    pub color: Option<String>,
    #[serde(rename = "color-safe", default)]
    pub color_safe: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectExpanded {
    pub id: i64,
    pub name: String,
    pub customer: Option<CustomerRef>,
    #[serde(default)]
    pub color: Option<String>,
    #[serde(rename = "color-safe", default)]
    pub color_safe: Option<String>,
}

impl ProjectExpanded {
    pub fn customer_name(&self) -> Option<&str> {
        self.customer.as_ref().map(|c| c.name.as_str())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityExpanded {
    pub id: i64,
    pub name: String,
    #[serde(default)]
    pub color: Option<String>,
    #[serde(rename = "color-safe", default)]
    pub color_safe: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimesheetCollectionExpanded {
    pub id: i64,
    pub begin: String,
    pub end: Option<String>,
    pub duration: Option<i64>,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    #[serde(default)]
    pub rate: Option<f64>,
    #[serde(rename = "internalRate", default)]
    pub internal_rate: Option<f64>,
    #[serde(default)]
    pub billable: Option<bool>,
    pub project: ProjectExpanded,
    pub activity: ActivityExpanded,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TimesheetFilterParams {
    pub page: Option<i32>,
    pub size: Option<i32>,
    pub begin: Option<String>,
    pub end: Option<String>,
    pub customer: Option<i64>,
    pub project: Option<i64>,
    pub activity: Option<i64>,
    pub order_by: Option<String>,
    pub order: Option<String>,
    pub term: Option<String>,
}

#[derive(Clone)]
pub struct KimaiClient {
    base_url: String,
    client: reqwest::Client,
}

/// Kimai instance root URL (without `/api`). Paths like `/api/users/me` are appended by the client.
pub fn normalize_base_url(url: &str) -> String {
    let mut base = url.trim().trim_end_matches('/').to_string();
    // Users often paste the API prefix from Kimai docs; avoid /api/api/...
    if base.ends_with("/api") {
        base.truncate(base.len() - 4);
        base = base.trim_end_matches('/').to_string();
    }
    base
}

fn api_error_message(status: u16, url: &str, body: &str) -> String {
    let mut msg = format!("API-Fehler {status} bei {url}");
    if !body.is_empty() {
        msg.push_str(&format!(": {body}"));
    }
    if status == 404 {
        msg.push_str(
            ". Prüfe die Instanz-URL (ohne /api am Ende, z. B. https://kimai.example.com).",
        );
        if url.contains("/api/api/") {
            msg.push_str(" Die URL enthält vermutlich ein doppeltes /api.");
        }
    }
    if status == 500 && url.contains("/api/timesheets") {
        msg.push_str(
            ". Prüfe, ob Projekt und Aktivität zusammenpassen und ob die Aktivität für dieses Projekt erlaubt ist.",
        );
    }
    msg
}

impl KimaiClient {
    pub fn new(url: String, token: String) -> Result<Self, String> {
        let base_url = normalize_base_url(&url);
        if base_url.is_empty() {
            return Err("API-URL darf nicht leer sein.".to_string());
        }
        let mut headers = HeaderMap::new();
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", token.trim()))
                .map_err(|e| e.to_string())?,
        );
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
        let client = reqwest::Client::builder()
            .default_headers(headers)
            .build()
            .map_err(|e| e.to_string())?;
        Ok(Self { base_url, client })
    }

    async fn get<T: for<'de> Deserialize<'de>>(&self, path: &str) -> Result<T, String> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(api_error_message(status.as_u16(), &url, &body));
        }
        response.json().await.map_err(|e| e.to_string())
    }

    async fn post<T: for<'de> Deserialize<'de>>(
        &self,
        path: &str,
        body: &impl Serialize,
    ) -> Result<T, String> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .post(&url)
            .json(body)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(api_error_message(status.as_u16(), &url, &body));
        }
        response.json().await.map_err(|e| e.to_string())
    }

    async fn patch<T: for<'de> Deserialize<'de>>(
        &self,
        path: &str,
        body: &impl Serialize,
    ) -> Result<T, String> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .patch(&url)
            .json(body)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(api_error_message(status.as_u16(), &url, &body));
        }
        response.json().await.map_err(|e| e.to_string())
    }

    async fn delete(&self, path: &str) -> Result<(), String> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .delete(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(api_error_message(status.as_u16(), &url, &body));
        }
        Ok(())
    }

    pub async fn validate(&self) -> Result<UserEntity, String> {
        self.get("/api/users/me").await
    }

    pub async fn get_active_timesheet(&self) -> Result<Vec<TimesheetCollectionExpanded>, String> {
        self.get("/api/timesheets/active").await
    }

    pub async fn start_timer(&self, form: TimesheetEditForm) -> Result<TimesheetEntity, String> {
        // Running timer: only project + activity (+ optional description/tags). No begin/end.
        self.post("/api/timesheets", &form).await
    }

    pub async fn restart_timesheet(&self, id: i64) -> Result<TimesheetEntity, String> {
        self.patch(
            &format!("/api/timesheets/{}/restart", id),
            &serde_json::json!({}),
        )
        .await
    }

    pub async fn stop_timer(&self, id: i64) -> Result<TimesheetEntity, String> {
        self.get(&format!("/api/timesheets/{}/stop", id)).await
    }

    pub async fn get_customers(&self) -> Result<Vec<CustomerCollection>, String> {
        self.get("/api/customers?visible=1&ignoreDates=1").await
    }

    pub async fn get_projects(
        &self,
        customer_id: Option<i64>,
    ) -> Result<Vec<ProjectCollection>, String> {
        let mut path = "/api/projects?visible=1&ignoreDates=1".to_string();
        if let Some(id) = customer_id {
            path.push_str(&format!("&customer={}", id));
        }
        self.get(&path).await
    }

    pub async fn get_tags(&self, name: Option<&str>) -> Result<Vec<String>, String> {
        let mut path = "/api/tags".to_string();
        if let Some(term) = name.filter(|s| !s.trim().is_empty()) {
            let encoded = urlencoding::encode(term.trim());
            path.push_str(&format!("?name={encoded}"));
        }
        self.get(&path).await
    }

    pub async fn create_tag(&self, name: &str) -> Result<TagEntity, String> {
        #[derive(Serialize)]
        struct TagEditForm<'a> {
            name: &'a str,
        }
        self.post("/api/tags", &TagEditForm { name }).await
    }

    pub async fn get_activities(
        &self,
        project_id: Option<i64>,
    ) -> Result<Vec<ActivityCollection>, String> {
        let mut path = "/api/activities?visible=1&ignoreDates=1".to_string();
        if let Some(id) = project_id {
            path.push_str(&format!("&project={}", id));
        }
        self.get(&path).await
    }

    pub async fn get_recent(
        &self,
        size: Option<i32>,
    ) -> Result<Vec<TimesheetCollectionExpanded>, String> {
        let size = size.unwrap_or(10);
        self.get(&format!("/api/timesheets/recent?size={}", size))
            .await
    }

    pub async fn get_today_timesheets(&self) -> Result<Vec<TimesheetCollectionExpanded>, String> {
        let today = Local::now().date_naive();
        let begin = format!("{}T00:00:00", today.format("%Y-%m-%d"));
        let path = format!(
            "/api/timesheets?begin={}&orderBy=begin&order=DESC&size=100&full=1",
            begin
        );
        self.get(&path).await
    }

    pub async fn list_timesheets(
        &self,
        params: TimesheetFilterParams,
    ) -> Result<Vec<TimesheetCollectionExpanded>, String> {
        let mut query = vec![
            ("full".to_string(), "1".to_string()),
            ("size".to_string(), params.size.unwrap_or(50).to_string()),
            ("page".to_string(), params.page.unwrap_or(1).to_string()),
        ];
        if let Some(begin) = params.begin {
            query.push(("begin".to_string(), begin));
        }
        if let Some(end) = params.end {
            query.push(("end".to_string(), end));
        }
        if let Some(customer) = params.customer {
            query.push(("customer".to_string(), customer.to_string()));
        }
        if let Some(project) = params.project {
            query.push(("project".to_string(), project.to_string()));
        }
        if let Some(activity) = params.activity {
            query.push(("activity".to_string(), activity.to_string()));
        }
        if let Some(order_by) = params.order_by {
            query.push(("orderBy".to_string(), order_by));
        }
        if let Some(order) = params.order {
            query.push(("order".to_string(), order));
        }
        if let Some(term) = params.term {
            query.push(("term".to_string(), term));
        }
        let qs: String = query
            .iter()
            .map(|(k, v)| format!("{}={}", k, v.replace(' ', "%20")))
            .collect::<Vec<_>>()
            .join("&");
        self.get(&format!("/api/timesheets?{}", qs)).await
    }

    pub async fn update_timesheet(
        &self,
        id: i64,
        form: TimesheetEditForm,
    ) -> Result<TimesheetEntity, String> {
        self.patch(&format!("/api/timesheets/{}", id), &form).await
    }

    pub async fn delete_timesheet(&self, id: i64) -> Result<(), String> {
        self.delete(&format!("/api/timesheets/{}", id)).await
    }
}

#[cfg(test)]
mod tests {
    use super::normalize_base_url;

    #[test]
    fn strips_trailing_api_suffix() {
        assert_eq!(
            normalize_base_url("https://kimai.example.com/api/"),
            "https://kimai.example.com"
        );
        assert_eq!(
            normalize_base_url("https://kimai.example.com/api"),
            "https://kimai.example.com"
        );
    }

    #[test]
    fn keeps_instance_root() {
        assert_eq!(
            normalize_base_url("https://kimai.example.com/"),
            "https://kimai.example.com"
        );
    }
}
