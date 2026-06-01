# Building PDF Shrinker for Windows

Build the Windows installer on Windows or with the GitHub Actions workflow in
`.github/workflows/build-windows.yml`.

## Required Sidecar

Add the Windows Ghostscript command-line binary here:

```text
src-tauri/binaries/pdf-shrinker-ghostscript-x86_64-pc-windows-msvc.exe
```

This should be the Ghostscript console executable, usually `gswin64c.exe`,
renamed to the Tauri sidecar filename above.

## Local Windows Build

On a Windows machine:

```powershell
npm ci --legacy-peer-deps
npm run tauri build
```

The installer output will be under:

```text
src-tauri/target/release/bundle/nsis/
src-tauri/target/release/bundle/msi/
```

## GitHub Actions Build

Push the project to GitHub with the Windows sidecar included, then run the
`Build Windows Installer` workflow manually from the Actions tab.

The workflow uploads the generated `.exe` and `.msi` files as artifacts.

## Licensing

Ghostscript is AGPL/commercial licensed. Make sure your distribution model is
compatible before shipping the bundled Windows binary.
