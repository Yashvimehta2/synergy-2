"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, TrendingUp, ShieldCheck, Wallet } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { calculateTrustScore } from "@/lib/aggregation/platform-connector";
import { TrustScore } from "@/components/dashboard/TrustScore";
import { ConnectPlatformDialog } from "@/components/platform/ConnectPlatformDialog";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";

export default function DashboardPage() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const [showConnect, setShowConnect] = useState(false);

  // Redirect if not onboarded
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace("/");
    }
  }, [hasCompletedOnboarding, router]);

  const platforms = useLiveQuery(() => db.platforms.toArray()) || [];
  const credentials = useLiveQuery(() => db.credentials.toArray()) || [];

  const connectedPlatforms = useMemo(
    () => platforms.filter((p) => p.connected),
    [platforms]
  );

  const trustScore = useMemo(
    () => calculateTrustScore(connectedPlatforms),
    [connectedPlatforms]
  );

  const totalEarnings = useMemo(
    () => connectedPlatforms.reduce((sum, p) => sum + (p.totalEarnings || 0), 0),
    [connectedPlatforms]
  );

  const handlePlatformConnected = useCallback(() => {
    setShowConnect(false);
  }, []);

  return (
    <div className="page-content">
      {/* Trust Score */}
      <div
        style={{
          textAlign: "center",
          padding: "24px 0 20px",
        }}
      >
        <TrustScore score={trustScore} size={200} />
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          icon={<ShieldCheck size={20} color="var(--success-500)" />}
          value={credentials.length.toString()}
          label="Verified"
          color="var(--success-500)"
        />
        <StatCard
          icon={<Wallet size={20} color="var(--primary-500)" />}
          value={connectedPlatforms.length.toString()}
          label="Platforms"
          color="var(--primary-500)"
        />
        <StatCard
          icon={<TrendingUp size={20} color="var(--warning-500)" />}
          value={totalEarnings > 0 ? formatCurrency(totalEarnings) : "₹0"}
          label="Earnings"
          color="var(--warning-500)"
        />
      </div>

      {/* Connected Platforms */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Connected Platforms
        </h2>

        {connectedPlatforms.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "32px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--primary-500)12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "32px",
              }}
            >
              🔗
            </div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
              No platforms connected yet
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "16px" }}>
              Connect your first platform to get started
            </p>
            <button
              onClick={() => setShowConnect(true)}
              style={{
                padding: "10px 24px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              Connect Platform
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {connectedPlatforms.map((platform) => (
              <div
                key={platform.id}
                className="card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <span style={{ fontSize: "32px" }}>{platform.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {platform.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                      marginTop: "2px",
                    }}
                  >
                    <span>⭐ {platform.avgRating?.toFixed(1)}</span>
                    <span>🚚 {platform.totalDeliveries?.toLocaleString()}</span>
                    <span>💰 {formatCurrency(platform.totalEarnings || 0)}</span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(16, 185, 129, 0.1)",
                  }}
                >
                  <div className="status-online" style={{ width: "6px", height: "6px" }} />
                  <span style={{ fontSize: "11px", color: "var(--success-500)", fontWeight: 500 }}>
                    Linked
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Platform FAB */}
      <button
        id="add-platform-fab"
        onClick={() => setShowConnect(true)}
        style={{
          position: "fixed",
          bottom: "calc(var(--nav-height) + 16px)",
          left: "16px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, var(--success-500), var(--success-700))",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(5, 150, 105, 0.4)",
          zIndex: 40,
          transition: "transform var(--transition-fast)",
        }}
        aria-label="Add platform"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Connect Platform Dialog */}
      <ConnectPlatformDialog
        open={showConnect}
        onClose={() => setShowConnect(false)}
        onConnected={handlePlatformConnected}
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: "14px 12px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        borderTop: `3px solid ${color}`,
      }}
    >
      {icon}
      <span
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "10px",
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
