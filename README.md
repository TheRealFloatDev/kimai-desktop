# Kimai Desktop

A native desktop client for [Kimai](https://www.kimai.org/) time tracking — built with **Tauri 2**, **React**, and **TypeScript**. Connect to your Kimai instance via API token, start and stop timers, browse history, and keep tracking from the menu bar / system tray.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Timer** — Start, stop, and restart time entries with customer, project, activity, description, and tags
- **Dashboard** — Active timer, working-time stats (today / week / month / year), recently used entries
- **History** — Filter by period, customer, project, and full-text search; edit and delete entries
- **System tray** — Live duration on macOS, quick access to recent entries, start/stop without opening the window
- **Background operation** — Closing the window hides the app; quit fully via tray **Quit**
- **Auto-start** — Optional launch at login
- **Updates** — In-app updater via GitHub Releases (sidebar notification)
- **Languages** — English, German, Dutch, French, Spanish

API credentials are stored locally via Tauri Stronghold; requests run through the Rust backend so the token never reaches the webview.

## Requirements

### End users

- A Kimai instance (self-hosted or cloud) with API access
- A personal **API token** (Kimai profile → API)

### Development

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9.x (`packageManager` in `package.json`)
- [Rust](https://www.rust-lang.org/) stable
- Platform deps for [Tauri 2](https://v2.tauri.app/start/prerequisites/) (WebKit on Linux, Xcode CLT on macOS, etc.)

## Getting started

```bash
git clone https://github.com/TheRealFloatDev/kimai-desktop.git
cd kimai-desktop
pnpm install
pnpm tauri dev
```

On first launch, enter your Kimai **base URL** (without `/api`, e.g. `https://kimai.example.com`) and **API token**.

### Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Frontend only (Vite) |
| `pnpm tauri dev` | Desktop app with hot reload |
| `pnpm build` | Production frontend build |
| `pnpm tauri build` | Native installers / bundles |
| `pnpm test` | Vitest unit tests |

## Project layout

```
src/                 React UI (routes, components, hooks)
src-tauri/           Rust backend (Kimai API, tray, credentials)
docs/RELEASES.md     CI releases & updater signing
```

## Releases

Official builds are created manually in GitHub Actions. See **[docs/RELEASES.md](docs/RELEASES.md)** for workflow setup, signing secrets, and version bumps.

## Security notes

- The API token is stored in an encrypted Stronghold vault on disk.
- Updater artifacts are verified with a Tauri signing public key embedded in the app config.
- macOS/Windows installer code signing is not set up; distribute via GitHub Releases and expect standard first-run prompts.

## License

MIT © [Alexander Neitzel](LICENSE)

Kimai is a registered trademark of its respective owners. This project is not affiliated with the official Kimai project.
