# Builds & Updates

## GitHub Releases

Pushes to the `release` branch (or manual **workflow_dispatch**) run [`.github/workflows/release.yml`](../.github/workflows/release.yml) via [tauri-action](https://github.com/tauri-apps/tauri-action).

Artifacts are published as GitHub Releases with tag `app-v<version>` (from `src-tauri/tauri.conf.json`). The action also uploads `latest.json` for the in-app updater.

### One-time setup

1. **Workflow permissions** (repo → Settings → Actions → General): enable *Read and write permissions* for the `GITHUB_TOKEN`.

2. **Updater signing secret** (required for updates, separate from Apple/Windows code signing):

   ```bash
   CI=true pnpm tauri signer generate -w src-tauri/.tauri-updater.key --ci
   ```

   Add the **private key file contents** as repository secret `TAURI_SIGNING_PRIVATE_KEY`.  
   The public key is already embedded in `src-tauri/tauri.conf.json` — if you regenerate keys, update that `pubkey` field.

3. Create and push the `release` branch when you want to ship:

   ```bash
   git checkout -b release
   git push -u origin release
   ```

Bump `version` in `package.json` and `src-tauri/tauri.conf.json` (and `Cargo.toml`) before each release.

### Code signing

macOS notarization and Windows Authenticode are **not** configured. Users may need to allow the app in system security settings. Updater packages are still signed with the Tauri updater key above.

## In-app updater

The sidebar shows an update card when a newer version exists on GitHub (`releases/latest/download/latest.json`). Download progress and restart are handled in the UI.
