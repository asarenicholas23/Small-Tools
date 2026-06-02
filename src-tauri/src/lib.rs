use serde::Serialize;
use std::fs;
use std::path::Path;
#[cfg(target_os = "windows")]
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

const VALID_QUALITIES: [&str; 4] = ["screen", "ebook", "printer", "prepress"];

#[derive(Serialize)]
struct CompressionMetadata {
    original_size: u64,
    compressed_size: u64,
    saved_percent: f64,
}

#[derive(Serialize)]
struct PdfFileInfo {
    name: String,
    size: u64,
}

#[tauri::command]
fn get_pdf_file_info(path: String) -> Result<PdfFileInfo, String> {
    let pdf = Path::new(&path);

    if !pdf.exists() {
        return Err("The selected PDF could not be found. Choose the file again.".into());
    }

    if !pdf.is_file() {
        return Err("The selected path is not a file. Choose a PDF file.".into());
    }

    if pdf
        .extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| !extension.eq_ignore_ascii_case("pdf"))
        .unwrap_or(true)
    {
        return Err("The selected file is not a PDF. Choose a file ending in .pdf.".into());
    }

    let size = fs::metadata(pdf)
        .map_err(|_| "Could not read the selected PDF size.".to_string())?
        .len();
    let name = pdf
        .file_name()
        .and_then(|file_name| file_name.to_str())
        .unwrap_or("Selected PDF")
        .to_string();

    Ok(PdfFileInfo { name, size })
}

#[tauri::command]
async fn compress_pdf(
    app: tauri::AppHandle,
    input_path: String,
    output_path: String,
    quality: String,
) -> Result<CompressionMetadata, String> {
    let input = Path::new(&input_path);
    let output = Path::new(&output_path);

    if !input.exists() {
        return Err("The selected PDF could not be found. Choose the file again.".into());
    }

    if !input.is_file() {
        return Err("The selected path is not a file. Choose a PDF file.".into());
    }

    if input
        .extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| !extension.eq_ignore_ascii_case("pdf"))
        .unwrap_or(true)
    {
        return Err("The selected file is not a PDF. Choose a file ending in .pdf.".into());
    }

    if !VALID_QUALITIES.contains(&quality.as_str()) {
        return Err("Choose a valid compression level before compressing.".into());
    }

    if let (Ok(input_canonical), Ok(output_canonical)) =
        (input.canonicalize(), output.canonicalize())
    {
        if input_canonical == output_canonical {
            return Err("Choose a different output path so the original PDF is not overwritten.".into());
        }
    } else if input_path == output_path {
        return Err("Choose a different output path so the original PDF is not overwritten.".into());
    }

    if let Some(parent) = output.parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            return Err("The output folder does not exist. Choose another location.".into());
        }
    }

    let original_size = fs::metadata(input)
        .map_err(|_| "Could not read the selected PDF size.".to_string())?
        .len();

    let output_arg = format!("-sOutputFile={}", output_path);
    let pdf_settings_arg = format!("-dPDFSETTINGS=/{}", quality);
    let args = [
        "-sDEVICE=pdfwrite".to_string(),
        "-dCompatibilityLevel=1.4".to_string(),
        pdf_settings_arg,
        "-dNOPAUSE".to_string(),
        "-dQUIET".to_string(),
        "-dBATCH".to_string(),
        output_arg,
        input_path,
    ];

    #[cfg(target_os = "windows")]
    let output_result = {
        let resource_dir = app
            .path()
            .resource_dir()
            .map_err(|error| format!("Could not locate the app resources folder: {error}"))?;
        let ghostscript_dir = resource_dir.join("ghostscript");
        let ghostscript_bin = ghostscript_dir.join("bin").join("gswin64c.exe");

        if !ghostscript_bin.exists() {
            return Err(format!(
                "The bundled Ghostscript runtime is missing. Expected to find {}.",
                ghostscript_bin.display()
            ));
        }

        std::process::Command::new(&ghostscript_bin)
            .args(&args)
            .env("GS_LIB", ghostscript_dir.join("lib"))
            .output()
            .map_err(|error| {
                format!(
                    "Ghostscript could not be started. Check that the bundled runtime is present. Details: {error}"
                )
            })?
    };

    #[cfg(not(target_os = "windows"))]
    let output_result = {
        let sidecar = app
            .shell()
            .sidecar("pdf-shrinker-ghostscript")
            .map_err(|error| {
                format!(
                    "The bundled Ghostscript binary is missing or could not be resolved: {error}"
                )
            })?;

        sidecar.args(args).output().await.map_err(|error| {
            format!("Ghostscript could not be started. Check that the bundled binary is present and executable. Details: {error}")
        })?
    };

    if !output_result.status.success() {
        let stderr = String::from_utf8_lossy(&output_result.stderr);
        let stdout = String::from_utf8_lossy(&output_result.stdout);
        let details = stderr.trim();
        let fallback = stdout.trim();

        return Err(if !details.is_empty() {
            format!("Ghostscript could not compress this PDF. {details}")
        } else if !fallback.is_empty() {
            format!("Ghostscript could not compress this PDF. {fallback}")
        } else {
            let code = output_result
                .status
                .code()
                .map(|status| status.to_string())
                .unwrap_or_else(|| "unknown".to_string());
            format!(
                "Ghostscript could not compress this PDF. It exited with status {code} and did not return more details."
            )
        });
    }

    if !output.exists() {
        return Err("Ghostscript finished, but no output PDF was created.".into());
    }

    let compressed_size = fs::metadata(output)
        .map_err(|_| "Could not read the compressed PDF size.".to_string())?
        .len();
    let saved_percent = if original_size == 0 {
        0.0
    } else {
        ((original_size as f64 - compressed_size as f64) / original_size as f64) * 100.0
    };

    Ok(CompressionMetadata {
        original_size,
        compressed_size,
        saved_percent,
    })
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![compress_pdf, get_pdf_file_info])
        .run(tauri::generate_context!())
        .expect("error while running PDF Shrinker");
}
