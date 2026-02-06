import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "../components/ThemeProvider";
import UISettingsProvider from "../components/UISettingsProvider";

export const metadata: Metadata = {
  title: "Social IT - Digital Solutions",
  description: "We build amazing digital solutions for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const defaultTheme = {
                  primary: "#58a6ff",
                  secondary: "#388bfd",
                  accent: "#58a6ff",
                  background: "#0d1117",
                  surface: "#161b22",
                  text: "#e6edf3",
                  textSecondary: "#8b949e",
                  border: "#30363d",
                  success: "#3fb950",
                  warning: "#d29922",
                  error: "#f85149",
                  info: "#58a6ff",
                };
                let theme = defaultTheme;
                try {
                  const stored = localStorage.getItem("site-theme");
                  if (stored) {
                    theme = JSON.parse(stored);
                  }
                } catch (e) {}
                const root = document.documentElement;
                root.style.setProperty("--color-primary", theme.primary);
                root.style.setProperty("--color-secondary", theme.secondary);
                root.style.setProperty("--color-accent", theme.accent);
                root.style.setProperty("--color-background", theme.background);
                root.style.setProperty("--color-surface", theme.surface);
                root.style.setProperty("--color-text", theme.text);
                root.style.setProperty("--color-text-secondary", theme.textSecondary);
                root.style.setProperty("--color-border", theme.border);
                root.style.setProperty("--color-success", theme.success);
                root.style.setProperty("--color-warning", theme.warning);
                root.style.setProperty("--color-error", theme.error);
                root.style.setProperty("--color-info", theme.info);
              })();
            `,
          }}
        />
        <ThemeProvider>
          <UISettingsProvider>{children}</UISettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
