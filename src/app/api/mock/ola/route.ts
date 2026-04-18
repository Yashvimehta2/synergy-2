import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = {
    platform: "Ola",
    workerId: "OLA-DRV-91234",
    workerName: "Rajesh Kumar",
    totalTrips: 1567,
    avgRating: 4.5,
    totalEarnings: 356000,
    activeMonths: 20,
    zone: "Mumbai - Suburban",
    joinDate: "2023-04-20",
    vehicleType: "Auto Rickshaw",
    monthlyEarnings: [
      { month: "2024-07", amount: 32000, trips: 120, avgRating: 4.5 },
      { month: "2024-08", amount: 29000, trips: 108, avgRating: 4.4 },
      { month: "2024-09", amount: 34000, trips: 128, avgRating: 4.6 },
      { month: "2024-10", amount: 31000, trips: 116, avgRating: 4.5 },
      { month: "2024-11", amount: 28000, trips: 105, avgRating: 4.5 },
      { month: "2024-12", amount: 35000, trips: 132, avgRating: 4.6 },
    ],
    badges: ["Veteran Driver", "Punctuality Star"],
    lastActive: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
