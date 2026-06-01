# Building PDF Shrinker for Windows

Build the Windows installer on Windows or with the GitHub Actions workflow in
`.github/workflows/build-windows.yml`.

## GitHub Actions Build

Push the project to GitHub, then run the `Build Windows Installer` workflow from
the Actions tab. The workflow downloads the official Artifex Windows Ghostscript
installer, extracts `gswin64c.exe` to the expected Tauri sidecar filename, builds
the installer on `windows-2022`, and uploads the generated `.exe` file as an
artifact. If packaging fails, it also uploads a `pdf-shrinker-windows-build-log`
artifact with the full Tauri output.

## Local Windows Build

For a local Windows build, add the Windows Ghostscript command-line binary here:

```text
src-tauri/binaries/pdf-shrinker-ghostscript-x86_64-pc-windows-msvc.exe
```

This should be the Ghostscript console executable, usually `gswin64c.exe`,
renamed to the Tauri sidecar filename above.

Then run:

```powershell
npm ci --legacy-peer-deps
npm run tauri build -- --bundles nsis
```

The installer output will be under:

```text
src-tauri/target/release/bundle/nsis/
```

## Licensing

Ghostscript is AGPL/commercial licensed. Make sure your distribution model is
compatible before shipping the bundled Windows binary.
