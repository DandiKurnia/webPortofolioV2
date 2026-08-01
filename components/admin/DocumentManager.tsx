"use client";

import { useRef } from "react";

export interface DocItem {
  id: string;
  url: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentManagerProps {
  windowTitle: string;
  title: string;
  description: string;
  doc: DocItem | null;
  isUploading: boolean;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DocumentManager({
  windowTitle,
  title,
  description,
  doc,
  isUploading,
  onFileSelected,
  onRemove,
}: DocumentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section>
      <div className="border-4 border-on-surface bg-surface-container-lowest brutal-shadow overflow-hidden">
        <div className="bg-on-surface p-3 flex items-center gap-2 border-b-4 border-on-surface">
          <div className="w-4 h-4 rounded-full bg-error border-2 border-on-surface"></div>
          <div className="w-4 h-4 rounded-full bg-[#FFBD2E] border-2 border-on-surface"></div>
          <div className="w-4 h-4 rounded-full bg-[#27C93F] border-2 border-on-surface"></div>
          <span className="ml-4 font-mono text-[14px] leading-[120%] font-bold text-surface">
            {windowTitle}
          </span>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-headline text-[32px] leading-[110%] font-black text-on-surface">
                {title}
              </h2>
              <p className="font-body text-[14px] text-on-surface-variant">
                {description}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelected(file);
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="border-4 border-on-surface bg-secondary text-on-secondary p-3 brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">
                {isUploading ? "progress_activity" : "upload_file"}
              </span>
              <span className="font-mono text-[14px] font-bold uppercase">
                {isUploading ? "Uploading..." : doc ? "Replace" : "Upload"}
              </span>
            </button>
          </div>

          {doc ? (
            <div className="border-4 border-on-surface bg-primary-container/40 p-4 flex items-center gap-4 flex-wrap">
              <div className="w-16 h-16 border-4 border-on-surface bg-error/80 text-on-error flex items-center justify-center brutal-shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[32px]">
                  picture_as_pdf
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-on-surface truncate">
                  {doc.filename}
                </p>
                <p className="font-mono text-xs text-on-surface-variant">
                  {formatBytes(doc.sizeBytes)} · Uploaded{" "}
                  {formatDate(doc.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-4 border-on-surface bg-surface p-2 brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center"
                  title="Open"
                >
                  <span className="material-symbols-outlined">
                    open_in_new
                  </span>
                </a>
                <button
                  type="button"
                  onClick={onRemove}
                  className="border-4 border-on-surface bg-tertiary text-on-tertiary p-2 brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center"
                  title="Remove"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-surface-container-low border-4 border-dashed border-on-surface p-8 flex flex-col items-center justify-center gap-3 hover:bg-primary-container/20 hover:border-solid transition-all brutal-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
                upload_file
              </span>
              <p className="font-body text-[16px] font-medium text-on-surface">
                Click to upload {title.toLowerCase()}
              </p>
              <span className="font-mono text-[12px] font-bold text-on-surface-variant uppercase">
                PDF only · Max 10MB
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
