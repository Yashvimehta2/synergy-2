"use client";

import { useEffect, type ReactNode } from "react";
import { QueryProvider } from "@/lib/query/query-provider";
import { useAppStore } from "@/lib/store/app-store";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { VoiceFAB } from "@/components/voice/VoiceFAB";
import { usePathname } from "next/navigation";

function ThemeInitializer({ children }: { children: ReactNode }) {
  const { theme, textSize, setOnline } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-text-size", textSize);
  }, [theme, textSize]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setOnline]);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration may fail in dev
      });
    }
  }, []);

  return <>{children}</>;
}

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { hasCompletedOnboarding } = useAppStore();
  const isOnboarding = pathname === "/" && !hasCompletedOnboarding;

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <>
      <TopBar />
      <main className="page-container">
        {children}
      </main>
      <BottomNav />
      <VoiceFAB />
    </>
  );
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeInitializer>
        <AppShell>{children}</AppShell>
      </ThemeInitializer>
    </QueryProvider>
  );
}
