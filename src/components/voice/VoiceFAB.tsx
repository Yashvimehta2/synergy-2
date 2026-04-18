"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { SpeechEngine, type VoiceCommand } from "@/lib/voice/speech-engine";
import { useAppStore } from "@/lib/store/app-store";

const ROUTE_MAP: Record<VoiceCommand, string> = {
  GO_HOME: "/dashboard",
  SHOW_CREDENTIALS: "/credentials",
  SHARE_PROOF: "/share",
  SHOW_SETTINGS: "/settings",
  CONNECT_PLATFORM: "/dashboard",
  SHOW_PROFILE: "/settings",
  UNKNOWN: "",
};

export function VoiceFAB() {
  const router = useRouter();
  const { isVoiceActive, setVoiceActive, language } = useAppStore();
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "success" | "error">("idle");
  const engineRef = useRef<SpeechEngine | null>(null);

  useEffect(() => {
    engineRef.current = new SpeechEngine();
    return () => engineRef.current?.destroy();
  }, []);

  const handleResult = useCallback(
    (text: string, command: VoiceCommand) => {
      setTranscript(text);

      if (command !== "UNKNOWN") {
        setStatus("success");
        const route = ROUTE_MAP[command];
        if (route) {
          setTimeout(() => {
            router.push(route);
            setStatus("idle");
            setVoiceActive(false);
            setTranscript("");
          }, 1000);
        }
      } else {
        setStatus("error");
        setTimeout(() => {
          setStatus("idle");
          setTranscript("");
        }, 2000);
      }
    },
    [router, setVoiceActive]
  );

  const toggleListening = useCallback(() => {
    const engine = engineRef.current;
    if (!engine?.isSupported) return;

    if (isVoiceActive) {
      engine.stopListening();
      setVoiceActive(false);
      setStatus("idle");
      setTranscript("");
    } else {
      engine.setOnResult(handleResult);
      engine.setOnStateChange((listening) => {
        setVoiceActive(listening);
        if (listening) setStatus("listening");
      });
      const locale = language === "hi" ? "hi-IN" : "en-IN";
      engine.startListening(locale);
    }
  }, [isVoiceActive, setVoiceActive, handleResult, language]);

  if (typeof window !== "undefined" && !window.SpeechRecognition && !window.webkitSpeechRecognition) {
    return null;
  }

  return (
    <>
      {/* Transcript Bubble */}
      {(transcript || status === "listening") && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(var(--nav-height) + 80px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 20px",
            boxShadow: "var(--shadow-xl)",
            zIndex: 60,
            maxWidth: "300px",
            textAlign: "center",
          }}
          className="animate-slide-up"
        >
          {status === "listening" && !transcript && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="voice-wave">
                <span /><span /><span /><span /><span />
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Listening...
              </span>
            </div>
          )}
          {transcript && (
            <div>
              <p style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>
                &quot;{transcript}&quot;
              </p>
              {status === "success" && (
                <p style={{ color: "var(--success-500)", fontSize: "12px", marginTop: "4px" }}>
                  ✓ Got it!
                </p>
              )}
              {status === "error" && (
                <p style={{ color: "var(--warning-500)", fontSize: "12px", marginTop: "4px" }}>
                  Didn&apos;t catch that. Try again.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        id="voice-fab"
        onClick={toggleListening}
        style={{
          position: "fixed",
          bottom: "calc(var(--nav-height) + 16px)",
          right: "16px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: isVoiceActive
            ? "linear-gradient(135deg, var(--danger-500), var(--danger-600))"
            : "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isVoiceActive
            ? "0 0 20px rgba(239, 68, 68, 0.4)"
            : "0 0 20px rgba(59, 130, 246, 0.4)",
          zIndex: 60,
          transition: "all var(--transition-base)",
          transform: isVoiceActive ? "scale(1.1)" : "scale(1)",
        }}
        aria-label={isVoiceActive ? "Stop listening" : "Start voice command"}
      >
        {/* Pulse rings when active */}
        {isVoiceActive && (
          <>
            <span
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                border: "2px solid var(--danger-400)",
                opacity: 0.6,
              }}
              className="animate-pulse-ring"
            />
            <span
              style={{
                position: "absolute",
                inset: "-8px",
                borderRadius: "50%",
                border: "2px solid var(--danger-400)",
                opacity: 0.3,
              }}
              className="animate-pulse-ring"
            />
          </>
        )}
        {isVoiceActive ? <X size={24} /> : <Mic size={24} />}
      </button>
    </>
  );
}
