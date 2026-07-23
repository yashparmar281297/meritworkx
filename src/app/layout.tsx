import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MeritWorkX — Hire and work, on merit.",
  description:
    "MeritWorkX matches the right freelancer to the right job with an AI score and a plain-language reason — not the lowest bid.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} style={{ background: "var(--paper)", color: "var(--ink)" }}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-67YXNWJGHS" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-67YXNWJGHS');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}