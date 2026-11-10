import type { Metadata, Viewport } from "next";
import { Lexend, Noto_Sans_Devanagari, Noto_Sans_Kannada, Source_Sans_3 } from "next/font/google";
import "./globals.css";

/* Lexend (designed for reading ease) for headings, Source Sans 3 for text,
   Noto Sans for Devanagari and Kannada so all three scripts sit together. */
const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });
const source = Source_Sans_3({ variable: "--font-source", subsets: ["latin"] });
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"], weight: ["400", "500", "600", "700"] });
const knda = Noto_Sans_Kannada({ variable: "--font-knda", subsets: ["kannada"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Sahayak | Bank forms by voice",
  description: "Fill bank forms by speaking Kannada, Hindi or English.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a8a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} ${source.variable} ${deva.variable} ${knda.variable} antialiased`}>{children}</body>
    </html>
  );
}
