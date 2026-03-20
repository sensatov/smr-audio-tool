import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="app-panel space-y-3">
        <p className="inline-block border border-smrBorder px-3 py-1 text-xs font-semibold uppercase tracking-wide text-smrBlue">
          MIT Sloan Management Review
        </p>
        <h1 className="page-title text-[#a51134]">SMR Audio Production Tool</h1>
        <p className="text-base text-slate-700">
          Internal workflow utility for script prep and teaser creation.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/script-prep" className="tool-card block">
          <p className="mb-3 inline-flex h-8 w-8 items-center justify-center bg-smrBlue font-semibold text-white">
            1
          </p>
          <h2 className="font-serif text-2xl text-smrBlue">Script Prep</h2>
          <p className="mt-2 text-slate-700">
            Upload article HTML to generate a clean TTS-ready script for Descript.
          </p>
          <p className="mt-4 text-sm font-medium text-smrBlue">Open tool →</p>
        </Link>

        <Link href="/teaser" className="tool-card block">
          <p className="mb-3 inline-flex h-8 w-8 items-center justify-center bg-smrBlue font-semibold text-white">
            2
          </p>
          <h2 className="font-serif text-2xl text-smrBlue">Teaser Trimmer</h2>
          <p className="mt-2 text-slate-700">
            Upload a full-length MP3 to create a sixty-second teaser clip.
          </p>
          <p className="mt-4 text-sm font-medium text-smrBlue">Open tool →</p>
        </Link>
      </section>
    </div>
  );
}
