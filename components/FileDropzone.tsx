"use client";

import React, { useRef, useState, useCallback } from "react";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  className?: string;
}

export default function FileDropzone({
  onFile,
  accept = "image/*",
  maxSizeMB = 10,
  preview = true,
  className = "",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validateAndProcess = useCallback(
    (file: File) => {
      setError(null);

      // Validate type
      if (accept && accept !== "*") {
        const acceptedTypes = accept
          .split(",")
          .map((t) => t.trim().replace("*", ""));
        const isValid = acceptedTypes.some((type) =>
          file.type.startsWith(type.replace("/*", ""))
        );
        if (!isValid) {
          setError(`Invalid file type. Accepted: ${accept}`);
          return;
        }
      }

      // Validate size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }

      setFileName(file.name);

      // Generate preview
      if (preview && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      onFile(file);
    },
    [accept, maxSizeMB, preview, onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          min-h-40 rounded-xl border-2 border-dashed cursor-pointer
          transition-colors p-6 text-center
          ${
            dragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-2 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="max-h-48 rounded-lg object-contain shadow"
            />
            <p className="text-xs text-gray-500 truncate max-w-full">
              {fileName}
            </p>
            <p className="text-xs text-indigo-600 font-medium">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              Drop your receipt here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or{" "}
              <span className="text-indigo-600 font-medium">
                click to browse
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {accept.replace("image/*", "Images")} — max {maxSizeMB}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
