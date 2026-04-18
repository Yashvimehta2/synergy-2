import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = {
    platform: "Uber",
    workerId: "UBR-DRV-56891",
    workerName: "Rajesh Kumar",
    totalTrips: 2340,
    avgRating: 4.7,
    totalEarnings: 485000,
    activeMonths: 24,
    zone: "Mumbai Metropolitan",
    joinDate: "2022-12-10",
    vehicleType: "Car - Sedan",
    monthlyEarnings: [
      { month: "2024-07", amount: 42000, trips: 156, avgRating: 4.7 },
      { month: "2024-08", amount: 38000, trips: 142, avgRating: 4.6 },
      { month: "2024-09", amount: 45000, trips: 168, avgRating: 4.8 },
      { month: "2024-10", amount: 41000, trips: 152, avgRating: 4.7 },
      { month: "2024-11", amount: 39000, trips: 145, avgRating: 4.7 },
      { month: "2024-12", amount: 43000, trips: 160, avgRating: 4.8 },
    ],
    badges: ["Diamond Driver", "5000+ Trips", "Safety Champion"],
    cancellationRate: 2.1,
    acceptanceRate: 94.5,
    lastActive: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
