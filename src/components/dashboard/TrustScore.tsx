"use client";

import { useEffect, useState } from "react";

interface TrustScoreProps {
  score: number;
  size?: number;
}

export function TrustScore({ score, size = 180 }: TrustScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const offset = circumference - progress;

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 75) return { main: "var(--success-500)", glow: "var(--success-400)" };
    if (s >= 50) return { main: "var(--primary-500)", glow: "var(--primary-400)" };
    if (s >= 25) return { main: "var(--warning-500)", glow: "var(--warning-400)" };
    return { main: "var(--danger-500)", glow: "var(--danger-400)" };
  };

  const colors = getColor(animatedScore);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        margin: "0 auto",
      }}
      className="trust-ring"
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary-400)" />
            <stop offset="50%" stopColor="var(--success-400)" />
            <stop offset="100%" stopColor="var(--success-600)" />
          </linearGradient>
        </defs>
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={animatedScore >= 50 ? "url(#trustGradient)" : colors.main}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.3s ease",
            filter: `drop-shadow(0 0 6px ${colors.glow})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.28,
            fontWeight: 800,
            color: colors.main,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {animatedScore}
        </span>
        <span
          style={{
            fontSize: size * 0.08,
            fontWeight: 500,
            color: "var(--text-tertiary)",
            marginTop: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Trust Score
        </span>
      </div>
    </div>
  );
}
