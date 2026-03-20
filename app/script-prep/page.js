"use client";

import Link from "next/link";
import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import QAChecklist from "../../components/QAChecklist";
import { parseArticleHtml } from "../../lib/parseArticle";

export default function ScriptPrepPage() {
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (file) => {
    setError("");
    setOutput("");
    if (!file.name.toLowerCase().endsWith(".html")) {
      setError("Please upload an HTML file.");
      return;
    }

    setLoading(true);
    try {
      const rawHtml = await file.text();
      const script = parseArticleHtml(rawHtml);
      setOutput(script);
    } catch (err) {
      setError(
        err?.message ||
          "Could not process this file. Make sure you uploaded the full HTML source of an MIT SMR article."
      );
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
        <h1 className="page-title">Script Prep</h1>
        <p className="mt-1 text-slate-700">
          Upload a WordPress article source HTML file to generate a TTS-ready script.
        </p>
      </header>

      <FileUpload accept=".html,text/html" label="Upload source HTML file" onFileSelect={handleFileSelect} />

      {loading && <p className="text-sm text-slate-600">Processing article...</p>}
      {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {output && (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigator.clipboard.writeText(output)}
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setOutput("");
                setError("");
              }}
            >
              Process Another
            </button>
          </div>

          <textarea
            readOnly
            value={output}
            className="h-96 w-full border border-smrBorder bg-white p-4 font-mono text-sm leading-6 focus:outline-none focus:ring-1 focus:ring-smrBlue"
          />

          <QAChecklist />
        </section>
      )}
    </div>
  );
}
