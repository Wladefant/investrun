import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Future You Simulator | PostFinance",
  description:
    "See your financial future. Simulate decades of investing in minutes. Learn behavioral finance by doing.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pf-black text-pf-white antialiased">
        {children}
      </body>
    </html>
  );
}
