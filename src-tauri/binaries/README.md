# Ghostscript Sidecar Binaries

Place Ghostscript command-line binaries in this folder before building installers.

The app resolves a bundled Tauri sidecar named `pdf-shrinker-ghostscript`, configured as:

```json
"externalBin": ["binaries/pdf-shrinker-ghostscript"]
```

Tauri packages sidecars by target triple, so the final files must use these names:

| Platform | Source binary you provide | Tauri sidecar filename |
| --- | --- | --- |
| Windows x64 | `ghostscript-windows-x86_64.exe` | `pdf-shrinker-ghostscript-x86_64-pc-windows-msvc.exe` |
| Linux x64 | `ghostscript-linux-x86_64` | `pdf-shrinker-ghostscript-x86_64-unknown-linux-gnu` |
| macOS Apple Silicon | `ghostscript-macos-aarch64` | `pdf-shrinker-ghostscript-aarch64-apple-darwin` |
| macOS Intel | `ghostscript-macos-x86_64` | `pdf-shrinker-ghostscript-x86_64-apple-darwin` |

The source binary names above match the project convention. Copy or rename them to
the Tauri sidecar filenames before running `npm run tauri:build`.

On Linux and macOS, make sure the copied sidecar files are executable:

```bash
chmod +x src-tauri/binaries/pdf-shrinker-ghostscript-*
```
