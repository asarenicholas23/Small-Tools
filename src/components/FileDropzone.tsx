import { useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export type SelectedPdf = {
  path: string;
  name: string;
  size?: number;
};

type FileDropzoneProps = {
  selectedPdf: SelectedPdf | null;
  selectedSize: string;
  onChoosePdf: () => void;
  onFileSelected: (file: SelectedPdf) => void;
};

export default function FileDropzone({
  selectedPdf,
  selectedSize,
  onChoosePdf,
  onFileSelected,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files.item(0);
    if (!file) return;

    const path = "path" in file ? String(file.path) : file.name;
    onFileSelected({
      path,
      name: file.name,
      size: file.size,
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition-colors",
        isDragging && "border-primary bg-accent",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
        <UploadCloud className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-base font-semibold text-slate-800">Drop a PDF here</p>
        <p className="text-sm text-muted-foreground">
          or choose a file from your computer.
        </p>
      </div>
      <Button className="mt-5" type="button" variant="outline" onClick={onChoosePdf}>
        Choose PDF
      </Button>

      {selectedPdf ? (
        <div className="mx-auto mt-5 flex max-w-xl items-center gap-3 rounded-md border bg-white p-3 text-left shadow-sm">
          <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{selectedPdf.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedSize || "Size will be verified before compression"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
