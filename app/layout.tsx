import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TP Bus Tracker - 台北公車通",
  description: "台北市公車即時到站查詢",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="font-sans">
      <body className="min-h-screen bg-twilight-bg text-twilight-text antialiased leading-relaxed font-normal">
        {children}
      </body>
    </html>
  );
}
