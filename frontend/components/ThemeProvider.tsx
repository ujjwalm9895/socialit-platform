"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getTheme, updateThemeVariables, type Theme } from "../lib/theme";
import { fetcher, LAYOUT_SWR_CONFIG } from "../lib/swr";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { data: themeData } = useSWR("/cms/site-settings/theme", fetcher, {
    ...LAYOUT_SWR_CONFIG,
    revalidateOnMount: true,
  });

  useEffect(() => {
    setMounted(true);
    const localTheme = getTheme();
    updateThemeVariables(localTheme);
  }, []);

  useEffect(() => {
    if (themeData && Object.keys(themeData).length > 0) {
      updateThemeVariables(themeData as Theme);
      if (typeof window !== "undefined") {
        localStorage.setItem("site-theme", JSON.stringify(themeData));
      }
    }
  }, [themeData]);

  useEffect(() => {
    const handleThemeUpdate = (event: CustomEvent) => {
      if (event.detail) {
        updateThemeVariables(event.detail);
        if (typeof window !== "undefined") {
          localStorage.setItem("site-theme", JSON.stringify(event.detail));
        }
      }
    };
    window.addEventListener("theme-updated", handleThemeUpdate as EventListener);
    return () => window.removeEventListener("theme-updated", handleThemeUpdate as EventListener);
  }, []);

  if (typeof window !== "undefined" && !mounted) {
    const localTheme = getTheme();
    updateThemeVariables(localTheme);
  }

  return <>{children}</>;
}
