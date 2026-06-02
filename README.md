# PDF Shrinker

PDF Shrinker is a cross-platform Tauri v2 desktop app for compressing PDF files
with a bundled Ghostscript command-line binary. Users do not need to install
Ghostscript separately when the correct sidecar binary is packaged with the app.

## Tech Stack

- Tauri v2
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Rust backend command for Ghostscript compression

## Install Dependencies

Install Node dependencies:

```bash
npm install
```

Install Rust and Tauri system prerequisites for your platform:

```bash
rustup update
```

For Linux, install WebKitGTK and build dependencies listed in the Tauri v2
Linux setup guide for your distribution.

## Run Development Mode

Run the Vite web UI:

```bash
npm run dev
```

Run the desktop app in Tauri development mode:

```bash
npm run tauri dev
```

Equivalent shorthand script:

```bash
npm run tauri:dev
```

The Tauri dev app expects a Ghostscript sidecar to be available in
`src-tauri/binaries` using the target-triple filename described below.

## Add Ghostscript Binaries

Put Ghostscript command-line binaries in:

```text
src-tauri/
  binaries/
    ghostscript-windows-x86_64.exe
    ghostscript-linux-x86_64
    ghostscript-macos-aarch64
    ghostscript-macos-x86_64
```

Tauri sidecars configured with `externalBin` also require target-triple
filenames. This app configures:

```json
"externalBin": ["binaries/pdf-shrinker-ghostscript"]
```

Copy or rename the binaries before building:

| Platform | Tauri sidecar filename |
| --- | --- |
| Windows x64 | `src-tauri/binaries/pdf-shrinker-ghostscript-x86_64-pc-windows-msvc.exe` |
| Linux x64 | `src-tauri/binaries/pdf-shrinker-ghostscript-x86_64-unknown-linux-gnu` |
| macOS Apple Silicon | `src-tauri/binaries/pdf-shrinker-ghostscript-aarch64-apple-darwin` |
| macOS Intel | `src-tauri/binaries/pdf-shrinker-ghostscript-x86_64-apple-darwin` |

On Linux and macOS, make the sidecar executable:

```bash
chmod +x src-tauri/binaries/pdf-shrinker-ghostscript-*
```

On Windows, `gswin64c.exe` also needs the Ghostscript runtime files. Copy the
extracted Windows Ghostscript `bin`, `lib`, and `Resource` folders into
`src-tauri/ghostscript` before a local Windows build. The GitHub Actions Windows
workflow does this automatically.

## Build Installers

Build the web assets and desktop installers:

```bash
npm run tauri build
```

Equivalent shorthand script:

```bash
npm run tauri:build
```

The Tauri bundle configuration enables platform installers where supported:

- Windows: NSIS `.exe` installer and WiX MSI where available
- Linux: `.AppImage` and `.deb`
- macOS: `.dmg`

Cross-compiling desktop installers usually requires building on each target OS
or configuring a dedicated cross-build environment.

For Windows builds, see [docs/WINDOWS_BUILD.md](docs/WINDOWS_BUILD.md).

## Compression Settings

The Rust command calls bundled Ghostscript with this pattern:

```bash
gs -sDEVICE=pdfwrite \
  -dCompatibilityLevel=1.4 \
  -dPDFSETTINGS=/ebook \
  -dNOPAUSE \
  -dQUIET \
  -dBATCH \
  -sOutputFile=output.pdf \
  input.pdf
```

The UI exposes these Ghostscript presets:

- Smallest file / screen
- Balanced / ebook
- High quality / printer
- Print-ready / prepress

## Licensing Note

Ghostscript is available under the GNU AGPL and under commercial licensing from
Artifex. Bundling Ghostscript in a distributed desktop application can trigger
license obligations. Review Ghostscript licensing carefully and obtain legal
advice or a commercial license if your distribution model requires it.
