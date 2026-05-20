# Builds & Updates

## GitHub Releases

Releases are built **manually** via GitHub Actions — there is no automatic trigger on branch pushes.

1. Open the repository on GitHub → **Actions** → workflow **publish**
2. Click **Run workflow** (workflow_dispatch)
3. Wait for all matrix jobs (macOS arm64/x64, Linux, Windows) to finish

The workflow [`.github/workflows/release.yml`](../.github/workflows/release.yml) uses [tauri-action](https://github.com/tauri-apps/tauri-action).

### Before each release

Bump the version in all of these (keep them in sync):

- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

Commit and push to the branch you run the workflow from (usually `main`).

### Published artifacts

- GitHub Release with tag `app-v<version>` (from `tauri.conf.json`)
- Installers per platform (`.dmg`, `.AppImage`, `.msi` / `.exe`, etc.)
- `latest.json` for the in-app updater (when `uploadUpdaterJson` is enabled)

### One-time repository setup

1. **Workflow permissions** (Settings → Actions → General): enable **Read and write permissions** for the `GITHUB_TOKEN`.

2. **Updater signing** (required for in-app updates; separate from Apple/Windows code signing):

   ```bash
   CI=true pnpm tauri signer generate -w src-tauri/.tauri-updater.key --ci
   ```

   - Add the **full private key file contents** as secret `TAURI_SIGNING_PRIVATE_KEY`
   - The **public** key lives in `src-tauri/tauri.conf.json` (`plugins.updater.pubkey`). Update it if you regenerate keys.

3. Optional: add `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` if the key is password-protected.

### Code signing (OS)

macOS notarization and Windows Authenticode are **not** configured. Users may need to allow the app in system security settings on first launch. Updater bundles are still signed with the Tauri updater key above.

## In-app updater

When a newer version is published, the sidebar shows an update card. It reads:

`https://github.com/TheRealFloatDev/kimai-desktop/releases/latest/download/latest.json`

Download progress and restart are handled in the UI.
