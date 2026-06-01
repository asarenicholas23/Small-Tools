import { Select } from "./ui/select";

export type CompressionQuality = "screen" | "ebook" | "printer" | "prepress";

type CompressionSettingsProps = {
  quality: CompressionQuality;
  onQualityChange: (quality: CompressionQuality) => void;
};

const qualityOptions = [
  { value: "screen", label: "Smallest file / screen" },
  { value: "ebook", label: "Balanced / ebook" },
  { value: "printer", label: "High quality / printer" },
  { value: "prepress", label: "Print-ready / prepress" },
];

export default function CompressionSettings({
  quality,
  onQualityChange,
}: CompressionSettingsProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700" htmlFor="quality">
        Compression level
      </label>
      <Select
        id="quality"
        value={quality}
        options={qualityOptions}
        onChange={(event) => onQualityChange(event.target.value as CompressionQuality)}
      />
    </div>
  );
}
