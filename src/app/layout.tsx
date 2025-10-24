import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // ✅ usa ruta relativa, no "@/app/globals.css"
import I18nProvider from "./i18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI PostCare",
  description: "Monitor and guide bariatric patients intelligently.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Wrap translations and global context providers */}
        <I18nProvider>
          {children} {/* ✅ Only render the current page here */}
        </I18nProvider>
      </body>
    </html>
  );
}

