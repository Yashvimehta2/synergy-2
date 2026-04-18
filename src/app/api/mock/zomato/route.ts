import { NextResponse } from "next/server";

export async function GET() {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = {
    platform: "Zomato",
    workerId: "ZMT-2024-78432",
    workerName: "Rajesh Kumar",
    totalDeliveries: 1247,
    avgRating: 4.8,
    totalEarnings: 287500,
    activeMonths: 18,
    zone: "Mumbai - Andheri West",
    joinDate: "2023-06-15",
    vehicleType: "Two Wheeler",
    monthlyEarnings: [
      { month: "2024-07", amount: 28000, deliveries: 95, avgRating: 4.9 },
      { month: "2024-08", amount: 31000, deliveries: 108, avgRating: 4.8 },
      { month: "2024-09", amount: 25000, deliveries: 87, avgRating: 4.7 },
      { month: "2024-10", amount: 29500, deliveries: 102, avgRating: 4.8 },
      { month: "2024-11", amount: 33000, deliveries: 115, avgRating: 4.9 },
      { month: "2024-12", amount: 27500, deliveries: 96, avgRating: 4.8 },
    ],
    badges: ["Top Performer", "Night Owl", "Speed Star"],
    lastActive: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
