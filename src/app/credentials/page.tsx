"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { CredentialCard } from "@/components/credential/CredentialCard";
import { FileCheck, ShieldCheck, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type VerifiableCredential } from "@/lib/db/database";
import { verifyCredential } from "@/lib/identity/credentials";

export default function CredentialsPage() {
  const router = useRouter();
  const credentials = useLiveQuery(() => db.credentials.toArray()) || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleShare = (credential: VerifiableCredential) => {
    router.push(`/share?credentialId=${credential.credentialId}`);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <FileCheck size={24} color="var(--primary-500)" />
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
            My Credentials
          </h1>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Your verified work documents
        </p>
      </div>

      {/* Badge Count */}
      {credentials.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            marginBottom: "20px",
          }}
        >
          <ShieldCheck size={18} color="var(--success-500)" />
          <span style={{ fontSize: "14px", color: "var(--success-500)", fontWeight: 600 }}>
            {credentials.length} Verified Credential{credentials.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Credentials List */}
      {credentials.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "48px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--primary-500)10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "40px",
            }}
          >
            📄
          </div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            No credentials yet
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "20px" }}>
            Connect a platform to get your first credential
          </p>
          <button
            onClick={() => router.push("/home")}
            style={{
              padding: "12px 24px",
              borderRadius: "var(--radius-full)",
              border: "none",
              background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Plus size={16} />
            Connect Platform
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {credentials.map((credential) => (
            <div key={credential.credentialId}>
              <CredentialCard
                credential={credential}
                onTap={() =>
                  setExpandedId(
                    expandedId === credential.credentialId
                      ? null
                      : credential.credentialId
                  )
                }
                onShare={() => handleShare(credential)}
              />

              {/* Expanded Details */}
              {expandedId === credential.credentialId && (
                <div
                  className="animate-slide-up"
                  style={{
                    marginTop: "8px",
                    padding: "16px 20px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Verification Details
                  </h4>
                  {verifyCredential(credential).checks.map((check) => (
                    <div
                      key={check.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>
                        {check.passed ? "✅" : "❌"}
                      </span>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                          {check.name}
                        </span>
                        <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                          {check.detail}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Raw Credential */}
                  <details style={{ marginTop: "12px" }}>
                    <summary
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      View Raw Credential JSON
                    </summary>
                    <pre
                      style={{
                        marginTop: "8px",
                        padding: "12px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-primary)",
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                        overflow: "auto",
                        maxHeight: "200px",
                        lineHeight: 1.5,
                      }}
                    >
                      {JSON.stringify(
                        {
                          "@context": credential["@context"],
                          type: credential.type,
                          issuer: credential.issuer,
                          issuanceDate: credential.issuanceDate,
                          credentialSubject: credential.credentialSubject,
                          proof: credential.proof,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
