import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open, save } from "@tauri-apps/plugin-dialog";
import { Archive, FolderOutput, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import FileDropzone, { SelectedPdf } from "./components/FileDropzone";
import CompressionSettings, { CompressionQuality } from "./components/CompressionSettings";
import ResultCard, { CompressionResult } from "./components/ResultCard";
import ErrorAlert from "./components/ErrorAlert";

type CompressPdfResponse = {
  original_size: number;
  compressed_size: number;
  saved_percent: number;
};

type PdfFileInfoResponse = {
  name: string;
  size: number;
};

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function defaultOutputPath(inputPath: string) {
  const separator = inputPath.includes("\\") ? "\\" : "/";
  const parts = inputPath.split(separator);
  const filename = parts.pop() ?? "compressed.pdf";
  const directory = parts.join(separator);
  const baseName = filename.toLowerCase().endsWith(".pdf")
    ? filename.slice(0, -4)
    : filename;
  const output = `${baseName}-compressed.pdf`;

  return directory ? `${directory}${separator}${output}` : output;
}

export default function App() {
  const [selectedPdf, setSelectedPdf] = useState<SelectedPdf | null>(null);
  const [quality, setQuality] = useState<CompressionQuality>("ebook");
  const [outputPath, setOutputPath] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompressionResult | null>(null);

  const selectedSize = useMemo(
    () => formatBytes(selectedPdf?.size),
    [selectedPdf?.size],
  );

  function handleFileSelected(pdf: SelectedPdf) {
    setSelectedPdf(pdf);
    setOutputPath(defaultOutputPath(pdf.path));
    setResult(null);
    setError("");
  }

  async function selectPdfFromPath(path: string) {
    try {
      const info = await invoke<PdfFileInfoResponse>("get_pdf_file_info", { path });
      handleFileSelected({ path, name: info.name, size: info.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    const unlistenPromise = getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type === "drop") {
        const [path] = event.payload.paths;
        if (path) {
          void selectPdfFromPath(path);
        }
      }
    });

    return () => {
      void unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  async function choosePdf() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "PDF files", extensions: ["pdf"] }],
    });

    if (typeof selected === "string") {
      await selectPdfFromPath(selected);
    }
  }

  async function chooseOutput() {
    const chosen = await save({
      defaultPath: outputPath || (selectedPdf ? defaultOutputPath(selectedPdf.path) : undefined),
      filters: [{ name: "PDF files", extensions: ["pdf"] }],
    });

    if (chosen) {
      setOutputPath(chosen);
      setError("");
    }
  }

  async function compress() {
    if (!selectedPdf) {
      setError("Choose a PDF before compressing.");
      return;
    }

    if (!outputPath) {
      setError("Choose where the compressed PDF should be saved.");
      return;
    }

    if (selectedPdf.path === outputPath) {
      setError("Choose a different output path so the original PDF is not overwritten.");
      return;
    }

    setIsCompressing(true);
    setError("");
    setResult(null);

    try {
      const response = await invoke<CompressPdfResponse>("compress_pdf", {
        inputPath: selectedPdf.path,
        outputPath,
        quality,
      });

      setResult({
        ...response,
        outputPath,
        originalSizeLabel: formatBytes(response.original_size),
        compressedSizeLabel: formatBytes(response.compressed_size),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card className="border-slate-200 shadow-lg shadow-slate-200/70">
          <CardHeader className="border-b bg-white/70">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Archive className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>PDF Shrinker</CardTitle>
                <CardDescription>
                  Compress PDF files locally with bundled Ghostscript.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <FileDropzone
              selectedPdf={selectedPdf}
              selectedSize={selectedSize}
              onChoosePdf={choosePdf}
              onFileSelected={handleFileSelected}
            />

            <CompressionSettings quality={quality} onQualityChange={setQuality} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="output-path">
                Output location
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="output-path"
                  className="h-10 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                  value={outputPath}
                  onChange={(event) => setOutputPath(event.target.value)}
                  placeholder="Choose an output PDF path"
                />
                <Button type="button" variant="outline" onClick={chooseOutput}>
                  <FolderOutput className="h-4 w-4" aria-hidden="true" />
                  Browse
                </Button>
              </div>
            </div>

            {error ? <ErrorAlert message={error} /> : null}

            <Button
              className="w-full"
              size="lg"
              type="button"
              disabled={isCompressing || !selectedPdf || !outputPath}
              onClick={compress}
            >
              {isCompressing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Archive className="h-4 w-4" aria-hidden="true" />
              )}
              {isCompressing ? "Compressing..." : "Compress PDF"}
            </Button>
          </CardContent>
        </Card>

        {result ? <ResultCard result={result} /> : null}
      </section>
    </main>
  );
}
