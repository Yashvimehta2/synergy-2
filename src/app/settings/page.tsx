"use client";

import { useAppStore, type ThemeMode, type TextSize, type Language } from "@/lib/store/app-store";
import { clearAllData } from "@/lib/db/database";
import { Settings as SettingsIcon, Sun, Moon, EyeOff, Type, Globe, Trash2, Info, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const THEMES: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "light", label: "Light", icon: <Sun size={20} />, desc: "Bright & clear" },
  { id: "dark", label: "Dark", icon: <Moon size={20} />, desc: "Easy on eyes" },
  { id: "high-contrast", label: "High Contrast", icon: <EyeOff size={20} />, desc: "Max visibility" },
];

const TEXT_SIZES: { id: TextSize; label: string; size: string }[] = [
  { id: "normal", label: "Normal", size: "16px" },
  { id: "large", label: "Large", size: "18px" },
  { id: "extra-large", label: "Extra Large", size: "20px" },
];

const LANGUAGES: { id: Language; label: string; native: string; flag: string }[] = [
  { id: "en", label: "English", native: "English", flag: "🇬🇧" },
  { id: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { id: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { id: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
];

export default function SettingsPage() {
  const { theme, setTheme, textSize, setTextSize, language, setLanguage, did, logout } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const router = useRouter();

  const handleClearData = async () => {
    await clearAllData();
    logout();
    router.push("/");
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <SettingsIcon size={24} color="var(--text-secondary)" />
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
            Settings
          </h1>
        </div>
      </div>

      {/* Language */}
      <SettingsSection title="Language" icon={<Globe size={18} color="var(--primary-500)" />}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              style={{
                padding: "14px 12px",
                borderRadius: "var(--radius-md)",
                border: language === lang.id ? "2px solid var(--primary-500)" : "1px solid var(--border-color)",
                background: language === lang.id ? "var(--primary-500)10" : "var(--bg-card)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all var(--transition-fast)",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "22px" }}>{lang.flag}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{lang.native}</div>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{lang.label}</div>
              </div>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Theme */}
      <SettingsSection title="Theme" icon={<Moon size={18} color="var(--primary-500)" />}>
        <div style={{ display: "flex", gap: "8px" }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                flex: 1,
                padding: "14px 8px",
                borderRadius: "var(--radius-md)",
                border: theme === t.id ? "2px solid var(--primary-500)" : "1px solid var(--border-color)",
                background: theme === t.id ? "var(--primary-500)10" : "var(--bg-card)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                transition: "all var(--transition-fast)",
                color: theme === t.id ? "var(--primary-500)" : "var(--text-secondary)",
              }}
            >
              {t.icon}
              <span style={{ fontSize: "12px", fontWeight: 600 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Text Size */}
      <SettingsSection title="Text Size" icon={<Type size={18} color="var(--primary-500)" />}>
        <div style={{ display: "flex", gap: "8px" }}>
          {TEXT_SIZES.map((ts) => (
            <button
              key={ts.id}
              onClick={() => setTextSize(ts.id)}
              style={{
                flex: 1,
                padding: "14px 8px",
                borderRadius: "var(--radius-md)",
                border: textSize === ts.id ? "2px solid var(--primary-500)" : "1px solid var(--border-color)",
                background: textSize === ts.id ? "var(--primary-500)10" : "var(--bg-card)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                transition: "all var(--transition-fast)",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: ts.size, fontWeight: 700 }}>Aa</span>
              <span style={{ fontSize: "11px", color: textSize === ts.id ? "var(--primary-500)" : "var(--text-tertiary)", fontWeight: 500 }}>
                {ts.label}
              </span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About" icon={<Info size={18} color="var(--primary-500)" />}>
        <div
          className="card"
          style={{ padding: "16px" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Version</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>1.0.0-beta</span>
          </div>
          {did && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>DID</span>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "var(--text-tertiary)",
                  maxWidth: "180px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {did}
              </span>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div style={{ marginTop: "32px", marginBottom: "32px" }}>
        <button
          onClick={() => setShowClearConfirm(true)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--danger-500)",
            background: "transparent",
            color: "var(--danger-500)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Trash2 size={18} />
          Clear All Data
        </button>
      </div>

      {/* Clear Data Confirm Dialog */}
      {showClearConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setShowClearConfirm(false)} />
          <div
            style={{
              position: "relative",
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              maxWidth: "340px",
              width: "90%",
              textAlign: "center",
            }}
            className="animate-scale-in"
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={28} color="var(--danger-500)" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Clear All Data?
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              This will delete all your credentials, connected platforms, and settings. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--danger-500)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        {icon}
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
