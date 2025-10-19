// Re-enable global styles (Tailwind) once PostCSS is configured correctly.
import "../styles/globals.css";
import { ReactNode } from "react";
import ClientProviders from "../components/ClientProviders";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "WriteFlow",
  description: "A production-grade single-admin blogging platform",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
