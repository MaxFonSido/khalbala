import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khal Bala · خال بالا",
  description: "Advanced World Cup 2026 prediction game for the knockout stage",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
