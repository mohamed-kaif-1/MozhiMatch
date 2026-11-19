import type { Metadata } from "next";
import "@fontsource/geist";
import "@fontsource/noto-sans-tamil";
import "./globals.css";

export const metadata: Metadata = {
  title: "MozhiMatch — Bilingual MCQ Preflight",
  description: "Bilingual English-Tamil MCQ review workbench for examination editors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen square-grid antialiased">{children}</body>
    </html>
  );
}

