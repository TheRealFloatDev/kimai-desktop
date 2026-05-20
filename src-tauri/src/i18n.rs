use serde_json::Value;

const EN: &str = include_str!("../../src/locales/en.json");
const DE: &str = include_str!("../../src/locales/de.json");
const NL: &str = include_str!("../../src/locales/nl.json");
const FR: &str = include_str!("../../src/locales/fr.json");
const ES: &str = include_str!("../../src/locales/es.json");

fn locale_json(locale: &str) -> &'static str {
    match locale {
        "de" => DE,
        "nl" => NL,
        "fr" => FR,
        "es" => ES,
        _ => EN,
    }
}

fn lookup<'a>(root: &'a Value, key: &str) -> Option<&'a str> {
    let mut cur = root;
    for part in key.split('.') {
        cur = cur.get(part)?;
    }
    cur.as_str()
}

pub fn t(locale: &str, key: &str) -> String {
    let root: Value =
        serde_json::from_str(locale_json(locale)).unwrap_or_else(|_| serde_json::json!({}));
    let en_root: Value = serde_json::from_str(EN).unwrap_or_else(|_| serde_json::json!({}));
    lookup(&root, key)
        .or_else(|| lookup(&en_root, key))
        .unwrap_or(key)
        .to_string()
}

pub fn t_fmt(locale: &str, key: &str, duration: &str) -> String {
    t(locale, key).replace("{{duration}}", duration)
}
