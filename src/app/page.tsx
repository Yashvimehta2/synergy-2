"use client";

import { useAppStore } from "@/lib/store/app-store";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { hasCompletedOnboarding } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      router.replace("/dashboard");
    }
  }, [hasCompletedOnboarding, router]);

  if (hasCompletedOnboarding) return null;

  return <OnboardingTutorial />;
}
