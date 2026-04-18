import { db } from "@/lib/db/database";
import { createCredential, storeCredential } from "@/lib/identity/credentials";

export interface PlatformInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  apiEndpoint: string;
}

export const AVAILABLE_PLATFORMS: PlatformInfo[] = [
  {
    id: "zomato",
    name: "Zomato",
    icon: "🍕",
    color: "#E23744",
    description: "Food delivery partner",
    apiEndpoint: "/api/mock/zomato",
  },
  {
    id: "uber",
    name: "Uber",
    icon: "🚗",
    color: "#000000",
    description: "Ride-hailing driver",
    apiEndpoint: "/api/mock/uber",
  },
  {
    id: "swiggy",
    name: "Swiggy",
    icon: "🛵",
    color: "#FC8019",
    description: "Food delivery partner",
    apiEndpoint: "/api/mock/swiggy",
  },
  {
    id: "ola",
    name: "Ola",
    icon: "🛺",
    color: "#1C8C3C",
    description: "Ride-hailing driver",
    apiEndpoint: "/api/mock/ola",
  },
  {
    id: "dunzo",
    name: "Dunzo",
    icon: "📦",
    color: "#00D573",
    description: "Delivery runner",
    apiEndpoint: "/api/mock/dunzo",
  },
];

export async function connectPlatform(
  platformId: string,
  userDid: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const platform = AVAILABLE_PLATFORMS.find((p) => p.id === platformId);
  if (!platform) {
    return { success: false, error: "Platform not found" };
  }

  try {
    // Simulate OAuth flow delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Fetch mock data
    const response = await fetch(platform.apiEndpoint);
    if (!response.ok) throw new Error("Failed to fetch platform data");

    const data = await response.json();

    // Store platform connection
    const existingPlatform = await db.platforms
      .where("platformId")
      .equals(platformId)
      .first();

    if (existingPlatform) {
      await db.platforms.update(existingPlatform.id!, {
        connected: true,
        lastSynced: new Date(),
        workerId: data.workerId,
        totalDeliveries: data.totalDeliveries || data.totalTrips,
        avgRating: data.avgRating,
        totalEarnings: data.totalEarnings,
        activeMonths: data.activeMonths,
        zone: data.zone,
      });
    } else {
      await db.platforms.add({
        platformId,
        name: platform.name,
        icon: platform.icon,
        color: platform.color,
        connected: true,
        lastSynced: new Date(),
        workerId: data.workerId,
        totalDeliveries: data.totalDeliveries || data.totalTrips,
        avgRating: data.avgRating,
        totalEarnings: data.totalEarnings,
        activeMonths: data.activeMonths,
        zone: data.zone,
      });
    }

    // Store work records
    if (data.monthlyEarnings) {
      for (const record of data.monthlyEarnings) {
        const existing = await db.workRecords
          .where({ platformId, month: record.month })
          .first();
        if (!existing) {
          await db.workRecords.add({
            platformId,
            month: record.month,
            earnings: record.amount,
            trips: record.deliveries || record.trips || 0,
            rating: record.avgRating,
            hoursWorked: Math.round(
              (record.deliveries || record.trips || 0) * 0.5
            ),
          });
        }
      }
    }

    // Create verifiable credential
    const vc = await createCredential({
      subjectDid: userDid,
      platform: platform.name,
      totalDeliveries: data.totalDeliveries || data.totalTrips,
      avgRating: data.avgRating,
      last6MonthsEarnings:
        data.monthlyEarnings?.reduce(
          (sum: number, m: { amount: number }) => sum + m.amount,
          0
        ) || data.totalEarnings,
      activeMonths: data.activeMonths,
      zone: data.zone,
    });

    await storeCredential(vc);

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

export function calculateTrustScore(platforms: {
  totalDeliveries?: number;
  avgRating?: number;
  totalEarnings?: number;
  activeMonths?: number;
}[]): number {
  if (platforms.length === 0) return 0;

  let score = 0;

  // Platform diversity (max 15 points)
  score += Math.min(platforms.length * 5, 15);

  for (const p of platforms) {
    // Earnings score (max 40 points total across platforms)
    const earnings = p.totalEarnings || 0;
    if (earnings > 500000) score += 10;
    else if (earnings > 200000) score += 7;
    else if (earnings > 100000) score += 5;
    else if (earnings > 50000) score += 3;

    // Rating score (max 30 points total)
    const rating = p.avgRating || 0;
    if (rating >= 4.8) score += 8;
    else if (rating >= 4.5) score += 6;
    else if (rating >= 4.0) score += 4;
    else if (rating >= 3.5) score += 2;

    // Tenure score (max 20 points total)
    const months = p.activeMonths || 0;
    if (months >= 24) score += 5;
    else if (months >= 12) score += 4;
    else if (months >= 6) score += 2;

    // Consistency - deliveries per month (max 10 points)
    const deliveries = p.totalDeliveries || 0;
    const dpm = months > 0 ? deliveries / months : 0;
    if (dpm >= 100) score += 3;
    else if (dpm >= 50) score += 2;
    else if (dpm >= 20) score += 1;
  }

  return Math.min(Math.round(score), 100);
}
