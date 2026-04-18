import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = {
    platform: "Dunzo",
    workerId: "DNZ-RNR-67890",
    workerName: "Rajesh Kumar",
    totalDeliveries: 456,
    avgRating: 4.9,
    totalEarnings: 112000,
    activeMonths: 8,
    zone: "Mumbai - Powai",
    joinDate: "2024-05-01",
    vehicleType: "Two Wheeler",
    monthlyEarnings: [
      { month: "2024-07", amount: 18000, deliveries: 52, avgRating: 4.9 },
      { month: "2024-08", amount: 19500, deliveries: 56, avgRating: 4.8 },
      { month: "2024-09", amount: 17000, deliveries: 48, avgRating: 4.9 },
      { month: "2024-10", amount: 21000, deliveries: 60, avgRating: 4.9 },
      { month: "2024-11", amount: 18500, deliveries: 53, avgRating: 5.0 },
      { month: "2024-12", amount: 20000, deliveries: 58, avgRating: 4.9 },
    ],
    badges: ["Dunzo Star", "Zero Cancel"],
    lastActive: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
