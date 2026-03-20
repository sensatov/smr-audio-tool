import "./globals.css";

export const metadata = {
  title: "SMR Audio Production Tool",
  description: "Script prep and teaser trimmer for MIT Sloan Management Review.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
