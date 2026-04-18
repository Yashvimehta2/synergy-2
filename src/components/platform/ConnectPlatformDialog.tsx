"use client";

import { useState } from "react";
import { AVAILABLE_PLATFORMS, type PlatformInfo } from "@/lib/aggregation/platform-connector";
import { connectPlatform } from "@/lib/aggregation/platform-connector";
import { useAppStore } from "@/lib/store/app-store";
import { X, ShieldCheck, Check, Loader2 } from "lucide-react";

interface ConnectPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected: (platformId: string) => void;
}

export function ConnectPlatformDialog({ open, onClose, onConnected }: ConnectPlatformDialogProps) {
  const { did, connectedPlatforms, addConnectedPlatform } = useAppStore();
  const [step, setStep] = useState<"select" | "consent" | "connecting" | "success">("select");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null);

  if (!open) return null;

  const handleSelect = (platform: PlatformInfo) => {
    setSelectedPlatform(platform);
    setStep("consent");
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !did) return;
    setStep("connecting");

    const result = await connectPlatform(selectedPlatform.id, did);
    if (result.success) {
      addConnectedPlatform(selectedPlatform.id);
      setStep("success");
      setTimeout(() => {
        onConnected(selectedPlatform.id);
        handleClose();
      }, 1500);
    } else {
      setStep("select");
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedPlatform(null);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "80vh",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          padding: "24px",
          overflowY: "auto",
        }}
        className="animate-slide-up"
      >
        {/* Handle */}
        <div
          style={{
            width: "40px",
            height: "4px",
            borderRadius: "2px",
            background: "var(--border-strong)",
            margin: "0 auto 20px",
          }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--bg-tertiary)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <X size={18} />
        </button>

        {/* Platform Selection */}
        {step === "select" && (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              Connect Platform
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Choose a platform to import your work history
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {AVAILABLE_PLATFORMS.map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => !isConnected && handleSelect(platform)}
                    disabled={isConnected}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      padding: "20px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: `2px solid ${isConnected ? "var(--success-500)" : "var(--border-color)"}`,
                      background: isConnected ? "rgba(16, 185, 129, 0.08)" : "var(--bg-secondary)",
                      cursor: isConnected ? "default" : "pointer",
                      opacity: isConnected ? 0.7 : 1,
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <span style={{ fontSize: "36px" }}>{platform.icon}</span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {platform.name}
                    </span>
                    {isConnected && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--success-500)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Check size={12} /> Connected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Consent Screen */}
        {step === "consent" && selectedPlatform && (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <span style={{ fontSize: "48px" }}>{selectedPlatform.icon}</span>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "12px" }}>
                Allow GigID to access your {selectedPlatform.name} data?
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>
                GigID will read your work history, ratings, and earnings to create verifiable credentials.
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              {["Work history & delivery count", "Ratings & reviews", "Earnings data (last 6 months)", "Account verification status"].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <ShieldCheck size={16} color="var(--success-500)" />
                  <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStep("select")}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Deny
              </button>
              <button
                onClick={handleConnect}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: `linear-gradient(135deg, ${selectedPlatform.color}, ${selectedPlatform.color}cc)`,
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: `0 4px 12px ${selectedPlatform.color}44`,
                }}
              >
                Allow Access
              </button>
            </div>
          </>
        )}

        {/* Connecting */}
        {step === "connecting" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Loader2
              size={48}
              color="var(--primary-500)"
              style={{ animation: "spin 1s linear infinite", margin: "0 auto" }}
            />
            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginTop: "20px" }}>
              Connecting to {selectedPlatform?.name}...
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px" }}>
              Fetching your work history and creating credential
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
              className="animate-scale-in"
            >
              <Check size={36} color="var(--success-500)" strokeWidth={3} />
            </div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--success-500)", marginTop: "20px" }}>
              Connected!
            </p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>
              Your {selectedPlatform?.name} credential has been created
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
