"use client";

import { useRef, useState } from "react";

export default function FileUpload({ accept, label, onFileSelect }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onFileSelect(file);
  };

  return (
    <div
      className={`border-2 border-dashed p-8 text-center transition ${
        dragging ? "border-smrBlue bg-cyan-50" : "border-smrBorder bg-white"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      <p className="font-medium text-smrBlue">{label}</p>
      <p className="mt-1 text-sm text-slate-600">Drag and drop or click to upload</p>
      <button
        type="button"
        className="primary-btn mt-4"
        onClick={() => inputRef.current?.click()}
      >
        Choose file
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
