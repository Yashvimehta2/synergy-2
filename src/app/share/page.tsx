"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type VerifiableCredential } from "@/lib/db/database";
import { generateProof, proofToShareableJSON, AVAILABLE_PREDICATES, type ZKPPredicate, type ZKProof } from "@/lib/identity/zkp";
import { QRCodeSVG } from "qrcode.react";
import { Share2, ShieldCheck, Loader2, Copy, CheckCircle2, QrCode, ChevronDown, Lock } from "lucide-react";

function SharePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedId = searchParams.get("credentialId");

  const credentials = useLiveQuery(() => db.credentials.toArray()) || [];
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);
  const [selectedPredicate, setSelectedPredicate] = useState<ZKPPredicate | null>(null);
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCredentialPicker, setShowCredentialPicker] = useState(false);

  // Auto-select preselected credential
  useEffect(() => {
    if (preselectedId && credentials.length > 0) {
      const found = credentials.find((c) => c.credentialId === preselectedId);
      if (found) setSelectedCredential(found);
    }
  }, [preselectedId, credentials]);

  const handleGenerateProof = async () => {
    if (!selectedCredential || !selectedPredicate) return;
    setIsGenerating(true);
    setProof(null);

    try {
      const result = await generateProof(selectedCredential, selectedPredicate);
      setProof(result);
    } catch (error) {
      console.error("Proof generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!proof) return;
    const shareData = proofToShareableJSON(proof);
    await navigator.clipboard.writeText(shareData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (credentials.length === 0) {
    return (
      <div className="page-content">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
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
            🔒
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
            No Credentials to Share
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginBottom: "20px" }}>
            Connect a platform first to generate proofs
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "12px 28px",
              borderRadius: "var(--radius-full)",
              border: "none",
              background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <Share2 size={24} color="#a78bfa" />
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
            Share &amp; Prove
          </h1>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Generate zero-knowledge proofs to share
        </p>
      </div>

      {/* Step 1: Select Credential */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "block" }}>
          1. Select Credential
        </label>
        <button
          onClick={() => setShowCredentialPicker(!showCredentialPicker)}
          className="card"
          style={{
            width: "100%",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            border: selectedCredential ? "2px solid var(--primary-500)" : "1px solid var(--border-color)",
            textAlign: "left",
          }}
        >
          {selectedCredential ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={18} color="var(--success-500)" />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                {selectedCredential.credentialSubject.platform} Credential
              </span>
            </div>
          ) : (
            <span style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
              Choose a credential...
            </span>
          )}
          <ChevronDown size={18} color="var(--text-tertiary)" />
        </button>

        {showCredentialPicker && (
          <div
            style={{
              marginTop: "8px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-elevated)",
              overflow: "hidden",
            }}
            className="animate-scale-in"
          >
            {credentials.map((cred) => (
              <button
                key={cred.credentialId}
                onClick={() => {
                  setSelectedCredential(cred);
                  setShowCredentialPicker(false);
                  setProof(null);
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "none",
                  borderBottom: "1px solid var(--border-color)",
                  background: selectedCredential?.credentialId === cred.credentialId ? "var(--primary-500)15" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ fontSize: "20px" }}>
                  {cred.credentialSubject.platform === "Zomato" ? "🍕" :
                   cred.credentialSubject.platform === "Uber" ? "🚗" :
                   cred.credentialSubject.platform === "Swiggy" ? "🛵" :
                   cred.credentialSubject.platform === "Ola" ? "🛺" : "📦"}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  {cred.credentialSubject.platform}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Select Predicate */}
      {selectedCredential && (
        <div style={{ marginBottom: "24px" }} className="animate-slide-up">
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "block" }}>
            2. What do you want to prove?
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {AVAILABLE_PREDICATES.map((pred, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedPredicate(pred);
                  setProof(null);
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-md)",
                  border: selectedPredicate === pred ? "2px solid var(--primary-500)" : "1px solid var(--border-color)",
                  background: selectedPredicate === pred ? "var(--primary-500)10" : "var(--bg-card)",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontWeight: selectedPredicate === pred ? 600 : 400,
                  transition: "all var(--transition-fast)",
                }}
              >
                <Lock size={16} color={selectedPredicate === pred ? "var(--primary-500)" : "var(--text-tertiary)"} />
                {pred.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Generate */}
      {selectedCredential && selectedPredicate && !proof && (
        <button
          id="generate-proof-btn"
          onClick={handleGenerateProof}
          disabled={isGenerating}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: isGenerating
              ? "var(--bg-tertiary)"
              : "linear-gradient(135deg, #7c3aed, #a78bfa)",
            color: "white",
            fontSize: "16px",
            fontWeight: 700,
            cursor: isGenerating ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "24px",
            boxShadow: isGenerating ? "none" : "0 4px 20px rgba(124, 58, 237, 0.3)",
          }}
          className="animate-slide-up"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              Generating ZK Proof...
            </>
          ) : (
            <>
              <ShieldCheck size={20} />
              Generate Proof
            </>
          )}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </button>
      )}

      {/* Proof Result */}
      {proof && (
        <div className="animate-scale-in" style={{ textAlign: "center" }}>
          {/* Success Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              background: proof.result ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
              border: `1px solid ${proof.result ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              marginBottom: "20px",
            }}
          >
            <CheckCircle2 size={16} color={proof.result ? "var(--success-500)" : "var(--danger-500)"} />
            <span style={{ fontSize: "14px", fontWeight: 600, color: proof.result ? "var(--success-500)" : "var(--danger-500)" }}>
              {proof.result ? "Proof Ready — Claim Verified!" : "Proof Ready — Claim Not Met"}
            </span>
          </div>

          {/* QR Code */}
          <div
            className="card"
            style={{
              padding: "24px",
              display: "inline-block",
              marginBottom: "16px",
            }}
          >
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <QrCode size={16} color="var(--text-tertiary)" />
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Scan to verify
              </span>
            </div>
            <div
              style={{
                padding: "16px",
                background: "white",
                borderRadius: "var(--radius-md)",
                display: "inline-block",
              }}
            >
              <QRCodeSVG
                value={proofToShareableJSON(proof)}
                size={200}
                level="M"
                includeMargin={false}
                fgColor="#0f172a"
              />
            </div>
          </div>

          {/* Proof Info */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              marginBottom: "16px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
              <span>Claim</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{selectedPredicate?.label}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
              <span>Protocol</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Groth16 / BN128</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-tertiary)" }}>
              <span>Expires</span>
              <span style={{ color: "var(--warning-500)", fontWeight: 500 }}>24 hours</span>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleCopy}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: copied ? "var(--success-500)" : "var(--text-primary)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {copied ? (
              <>
                <CheckCircle2 size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Proof Link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="page-content"><p>Loading...</p></div>}>
      <SharePageContent />
    </Suspense>
  );
}
