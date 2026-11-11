import { useCallback, useState } from "react";
import { Upload, File } from "lucide-react";

interface DocumentDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
}

export const DocumentDropzone = ({
  onFileSelect,
  accept,
}: DocumentDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-6
        transition-all duration-200 ease-in-out
        ${
          isDragging
            ? "border-accent/40 bg-accent/[0.08] scale-102"
            : "border-border bg-surface-strong/[0.03] hover:border-accent/25 hover:bg-surface-strong/[0.05]"
        }
      `}
    >
      <input
        type="file"
        onChange={handleFileInput}
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title=""
      />

      <div className="text-center">
        <div className="flex justify-center mb-2">
          {isDragging ? (
            <File className="h-8 w-8 animate-bounce text-accent" />
          ) : (
            <Upload className="h-8 w-8 text-subtle" />
          )}
        </div>

        <p className="text-sm text-subtle">
          {isDragging ? (
            <span className="font-medium text-accent">
              Drop your file here
            </span>
          ) : (
            <>
              <span className="font-medium text-accent">Click to upload</span>
              {" or drag and drop"}
            </>
          )}
        </p>

        <p className="mt-1 text-xs text-subtle">
          {accept.replace(/,/g, ", ")}
        </p>
      </div>
    </div>
  );
};
