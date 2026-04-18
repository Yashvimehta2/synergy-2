"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, FileCheck, Share2, Settings } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "home", href: "/home", icon: Home, label: "Home" },
  { id: "credentials", href: "/credentials", icon: FileCheck, label: "Documents" },
  { id: "share", href: "/share", icon: Share2, label: "Share" },
  { id: "settings", href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--nav-height)",
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "var(--safe-area-bottom)",
        zIndex: 50,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href === "/home" && pathname === "/");
        const Icon = item.icon;
        const showLabel = hoveredId === item.id || pressedId === item.id;

        return (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => router.push(item.href)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onTouchStart={() => setPressedId(item.id)}
            onTouchEnd={() => setTimeout(() => setPressedId(null), 1500)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minWidth: "64px",
              minHeight: "48px",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              position: "relative",
              transition: "transform var(--transition-fast)",
              transform: isActive ? "scale(1.1)" : "scale(1)",
            }}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  width: "24px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "linear-gradient(90deg, var(--primary-400), var(--primary-600))",
                }}
              />
            )}
            <Icon
              size={26}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{
                color: isActive ? "var(--primary-500)" : "var(--text-tertiary)",
                transition: "color var(--transition-fast)",
                filter: isActive ? "drop-shadow(0 0 8px var(--primary-400))" : "none",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--primary-500)" : "var(--text-tertiary)",
                opacity: showLabel || isActive ? 1 : 0,
                transform: showLabel || isActive ? "translateY(0)" : "translateY(4px)",
                transition: "all var(--transition-fast)",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
