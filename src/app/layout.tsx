import type { Metadata } from "next";
import "@fontsource/noto-sans-tamil";
import "./globals.css";

export const metadata: Metadata = {
  title: "MozhiMatch — Bilingual MCQ Preflight",
  description: "Bilingual English-Tamil MCQ review workbench for examination editors",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
