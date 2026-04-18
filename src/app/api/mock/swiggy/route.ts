import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = {
    platform: "Swiggy",
    workerId: "SWG-DEL-34521",
    workerName: "Rajesh Kumar",
    totalDeliveries: 890,
    avgRating: 4.6,
    totalEarnings: 198000,
    activeMonths: 12,
    zone: "Mumbai - Bandra",
    joinDate: "2024-01-05",
    vehicleType: "Two Wheeler",
    monthlyEarnings: [
      { month: "2024-07", amount: 22000, deliveries: 78, avgRating: 4.5 },
      { month: "2024-08", amount: 24000, deliveries: 85, avgRating: 4.6 },
      { month: "2024-09", amount: 21000, deliveries: 74, avgRating: 4.7 },
      { month: "2024-10", amount: 26000, deliveries: 92, avgRating: 4.6 },
      { month: "2024-11", amount: 23500, deliveries: 82, avgRating: 4.6 },
      { month: "2024-12", amount: 25000, deliveries: 88, avgRating: 4.7 },
    ],
    badges: ["Fast Delivery", "Customer Favorite"],
    lastActive: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
