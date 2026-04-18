import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subjectDid, platform, totalDeliveries, avgRating, last6MonthsEarnings, activeMonths, zone } = body;

    if (!subjectDid || !platform) {
      return NextResponse.json(
        { error: "Missing required fields: subjectDid, platform" },
        { status: 400 }
      );
    }

    // Simulate issuer processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    const credential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.org/",
      ],
      type: ["VerifiableCredential", "GigWorkerCredential"],
      issuer: "did:polygonid:polygon:amoy:2qR1FPernPDBfFqGPZ9XzSxBHjNFpBg9eGUvQ7FzCJ",
      issuanceDate: now.toISOString(),
      expirationDate: expiry.toISOString(),
      credentialSubject: {
        id: subjectDid,
        platform,
        totalDeliveries: totalDeliveries || 0,
        avgRating: avgRating || 0,
        last6MonthsEarnings: last6MonthsEarnings || 0,
        activeMonths: activeMonths || 0,
        zone: zone || "Unknown",
      },
      proof: {
        type: "BJJSignature2021",
        created: now.toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod:
          "did:polygonid:polygon:amoy:2qR1FPernPDBfFqGPZ9XzSxBHjNFpBg9eGUvQ7FzCJ#key-1",
      },
    };

    return NextResponse.json({
      success: true,
      credential,
      message: `Verifiable Credential issued for ${platform}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
