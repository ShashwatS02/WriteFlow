// Re-enable global styles (Tailwind) once PostCSS is configured correctly.
import "../styles/globals.css";
import { ReactNode } from "react";
import ClientProviders from "../components/ClientProviders";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: {
    default: "WriteFlow - Premium Blogging Platform",
    template: "%s | WriteFlow",
  },
  description:
    "A modern, production-grade blogging platform built with Next.js 15, React 19, and TypeScript. Create, manage, and publish beautiful blog posts with ease.",
  keywords: [
    "blog",
    "blogging",
    "writeflow",
    "next.js",
    "react",
    "typescript",
    "content management",
    "cms",
  ],
  authors: [{ name: "WriteFlow Team" }],
  creator: "WriteFlow",
  publisher: "WriteFlow",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WriteFlow - Premium Blogging Platform",
    description:
      "A modern, production-grade blogging platform built with Next.js 15",
    siteName: "WriteFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WriteFlow - Premium Blogging Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WriteFlow - Premium Blogging Platform",
    description:
      "A modern, production-grade blogging platform built with Next.js 15",
    images: ["/og-image.png"],
    creator: "@writeflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientProviders>
            <div className="fixed right-4 bottom-4 z-50">
              <ThemeToggle />
            </div>
            {children}
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
