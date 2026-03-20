"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FileUpload from "../../components/FileUpload";
import { trimAudioFile } from "../../lib/trimAudio";

function formatSeconds(seconds) {
  return `${seconds.toFixed(2)}s`;
}

export default function TeaserPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const handleFileSelect = async (file) => {
    setError("");
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
      setError("Please upload an audio file (.mp3, .wav, .ogg, .m4a).");
      return;
    }
    setLoading(true);
    try {
      if (result?.url) URL.revokeObjectURL(result.url);
      const trimmed = await trimAudioFile(file, 60);
      setResult({ ...trimmed, originalFilename: file.name });
    } catch (err) {
      setError(err?.message || "Could not process this file. Please upload a valid audio file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-smrBlue hover:underline">
        ← Back to home
      </Link>

      <header className="app-panel">
        <h1 className="page-title">Teaser Trimmer</h1>
        <p className="mt-1 text-slate-700">
          Upload a full-length narrated file and trim to the first sixty seconds.
        </p>
      </header>

      <FileUpload
        accept=".mp3,.wav,.ogg,.m4a,audio/*"
        label="Upload full-length narrated audio"
        onFileSelect={handleFileSelect}
      />

      {loading && <p className="text-sm text-slate-600">Processing audio... Large files may take time.</p>}
      {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {result && (
        <section className="app-panel space-y-3">
          <h2 className="font-serif text-2xl text-smrBlue">Teaser Ready</h2>
          <p className="text-sm">
            <strong>Original:</strong> {result.originalFilename}
          </p>
          <p className="text-sm">
            <strong>Original duration:</strong> {formatSeconds(result.originalDuration)}
          </p>
          <p className="text-sm">
            <strong>Teaser duration:</strong> {formatSeconds(result.teaserDuration)}
          </p>
          {result.wasShorterThanLimit && (
            <p className="text-sm text-slate-600">
              This file was already under sixty seconds, so it was returned as-is.
            </p>
          )}

          <audio controls src={result.url} className="w-full" />

          <a
            href={result.url}
            download={result.outputFilename}
            className="primary-btn inline-block"
          >
            Download: {result.outputFilename}
          </a>
          <p className="text-sm text-slate-600">Output is MP3 format.</p>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              if (result?.url) URL.revokeObjectURL(result.url);
              setResult(null);
              setError("");
            }}
          >
            Process Another File
          </button>
        </section>
      )}
    </div>
  );
}
