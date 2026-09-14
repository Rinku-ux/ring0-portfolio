import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DotGothic16, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const sans = DotGothic16({
  weight: "400",
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "ゲームとツール。",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${sans.variable} ${mono.variable}`}>
        <div className="grid-bg" />
        <div className="crt-overlay" />
        <div className="shell scanline panel">
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
