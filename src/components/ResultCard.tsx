import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Alert } from "./ui/alert";
import { Card, CardContent } from "./ui/card";

export type CompressionResult = {
  original_size: number;
  compressed_size: number;
  saved_percent: number;
  outputPath: string;
  originalSizeLabel: string;
  compressedSizeLabel: string;
};

type ResultCardProps = {
  result: CompressionResult;
};

export default function ResultCard({ result }: ResultCardProps) {
  const largerThanOriginal = result.compressed_size > result.original_size;

  return (
    <Card className="border-slate-200 shadow-md shadow-slate-200/60">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-slate-900">Compression complete</h2>
            <p className="text-sm text-muted-foreground">{result.outputPath}</p>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border bg-slate-50 p-3">
            <dt className="text-xs uppercase text-muted-foreground">Original</dt>
            <dd className="mt-1 text-lg font-semibold">{result.originalSizeLabel}</dd>
          </div>
          <div className="rounded-md border bg-slate-50 p-3">
            <dt className="text-xs uppercase text-muted-foreground">Compressed</dt>
            <dd className="mt-1 text-lg font-semibold">{result.compressedSizeLabel}</dd>
          </div>
          <div className="rounded-md border bg-slate-50 p-3">
            <dt className="text-xs uppercase text-muted-foreground">Reduction</dt>
            <dd className="mt-1 text-lg font-semibold">
              {result.saved_percent.toFixed(1)}%
            </dd>
          </div>
        </dl>

        {largerThanOriginal ? (
          <Alert variant="warning" className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              The compressed PDF is larger than the original. Try a stronger compression
              level or keep the original file.
            </span>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
