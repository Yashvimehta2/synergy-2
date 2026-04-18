"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Fingerprint, Link, ShieldCheck, Share2 } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { generateDID } from "@/lib/identity/did";
import { db } from "@/lib/db/database";

const STEPS = [
  {
    icon: <Link size={40} color="var(--primary-400)" />,
    emoji: "🔗",
    title: "Connect Your Work Apps",
    description: "Link Zomato, Uber, Swiggy and more to build your profile",
    color: "var(--primary-500)",
  },
  {
    icon: <ShieldCheck size={40} color="var(--success-400)" />,
    emoji: "🛡️",
    title: "Get Verified Credentials",
    description: "Your work history becomes verifiable digital documents",
    color: "var(--success-500)",
  },
  {
    icon: <Share2 size={40} color="#a78bfa" />,
    emoji: "🔒",
    title: "Share with Privacy",
    description: "Prove your income without revealing exact numbers using zero-knowledge proofs",
    color: "#a78bfa",
  },
  {
    icon: <Fingerprint size={40} color="var(--warning-400)" />,
    emoji: "💰",
    title: "Access Loans & Benefits",
    description: "Use your verified profile to unlock financial services",
    color: "var(--warning-500)",
  },
];

export function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingDID, setIsCreatingDID] = useState(false);
  const { setOnboardingCompleted, setUser } = useAppStore();
  const router = useRouter();

  const handleGetStarted = useCallback(async () => {
    setIsCreatingDID(true);
    try {
      const { did } = await generateDID();
      await db.profiles.add({
        did,
        name: "Gig Worker",
        phone: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setUser({ did, name: "Gig Worker", isAuthenticated: true });
      setOnboardingCompleted();
      router.push("/home");
    } catch (error) {
      console.error("Failed to create identity:", error);
      setIsCreatingDID(false);
    }
  }, [setOnboardingCompleted, setUser, router]);

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-20%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--primary-500)08, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--success-500)08, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <Fingerprint size={28} color="white" />
        </div>
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              background: "linear-gradient(135deg, var(--primary-400), var(--success-400))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            GigID
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "-2px" }}>
            Your Work, Your Identity
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div
        key={currentStep}
        className="animate-scale-in"
        style={{
          textAlign: "center",
          maxWidth: "340px",
          marginBottom: "40px",
        }}
      >
        {/* Mascot/Icon area */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: `${STEPS[currentStep].color}12`,
            border: `2px solid ${STEPS[currentStep].color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}
          className="animate-float"
        >
          <span style={{ fontSize: "52px" }}>{STEPS[currentStep].emoji}</span>
        </div>

        {/* Speech bubble */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            position: "relative",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "16px",
              height: "16px",
              background: "var(--bg-card)",
              borderTop: "1px solid var(--border-color)",
              borderLeft: "1px solid var(--border-color)",
            }}
          />
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            {STEPS[currentStep].title}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {STEPS[currentStep].description}
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "32px",
        }}
      >
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            style={{
              width: i === currentStep ? "32px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === currentStep ? "var(--primary-500)" : "var(--border-strong)",
              border: "none",
              cursor: "pointer",
              transition: "all var(--transition-base)",
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "340px" }}>
        {isLastStep ? (
          <button
            onClick={handleGetStarted}
            disabled={isCreatingDID}
            id="get-started-btn"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor: isCreatingDID ? "wait" : "pointer",
              boxShadow: "var(--shadow-glow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all var(--transition-fast)",
              opacity: isCreatingDID ? 0.7 : 1,
            }}
          >
            {isCreatingDID ? (
              <>Creating Your Identity...</>
            ) : (
              <>
                <Fingerprint size={20} />
                Get Started
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            Next
            <ChevronRight size={20} />
          </button>
        )}

        {!isLastStep && (
          <button
            onClick={handleGetStarted}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "transparent",
              color: "var(--text-tertiary)",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
