import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doc2LaTeX - Convert Documents to LaTeX",
  description: "Convert your documents and images into beautifully formatted LaTeX code with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
