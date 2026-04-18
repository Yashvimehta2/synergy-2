"use client";

import { type VerifiableCredential } from "@/lib/db/database";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ShieldCheck, Star, Truck, IndianRupee, ChevronRight, Calendar } from "lucide-react";

interface CredentialCardProps {
  credential: VerifiableCredential;
  onTap?: () => void;
  onShare?: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  Zomato: "#E23744",
  Uber: "#276EF1",
  Swiggy: "#FC8019",
  Ola: "#1C8C3C",
  Dunzo: "#00D573",
};

const PLATFORM_ICONS: Record<string, string> = {
  Zomato: "🍕",
  Uber: "🚗",
  Swiggy: "🛵",
  Ola: "🛺",
  Dunzo: "📦",
};

export function CredentialCard({ credential, onTap, onShare }: CredentialCardProps) {
  const { credentialSubject: cs } = credential;
  const platformColor = PLATFORM_COLORS[cs.platform] || "var(--primary-500)";
  const platformIcon = PLATFORM_ICONS[cs.platform] || "📄";

  return (
    <div
      onClick={onTap}
      className="card card-gradient"
      style={{
        padding: "0",
        cursor: onTap ? "pointer" : "default",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${platformColor}22, ${platformColor}08)`,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>{platformIcon}</span>
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {cs.platform}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Gig Worker Credential
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(16, 185, 129, 0.15)",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <ShieldCheck size={14} color="var(--success-500)" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--success-500)" }}>
              Verified
            </span>
          </div>
          {onTap && <ChevronRight size={18} color="var(--text-tertiary)" />}
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1px",
          background: "var(--border-color)",
        }}
      >
        <StatItem
          icon={<Truck size={18} color={platformColor} />}
          value={formatNumber(cs.totalDeliveries)}
          label="Deliveries"
        />
        <StatItem
          icon={<Star size={18} color="#fbbf24" fill="#fbbf24" />}
          value={cs.avgRating.toFixed(1)}
          label="Rating"
        />
        <StatItem
          icon={<IndianRupee size={18} color="var(--success-500)" />}
          value={formatCurrency(cs.last6MonthsEarnings)}
          label="6M Earnings"
        />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={13} color="var(--text-tertiary)" />
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
            Issued {new Date(credential.issuanceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              border: "none",
              background: `linear-gradient(135deg, ${platformColor}, ${platformColor}dd)`,
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1.05)";
              (e.target as HTMLElement).style.boxShadow = `0 4px 12px ${platformColor}44`;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1)";
              (e.target as HTMLElement).style.boxShadow = "none";
            }}
          >
            Share Proof
          </button>
        )}
      </div>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        padding: "14px 12px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {icon}
      <span
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1,
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
