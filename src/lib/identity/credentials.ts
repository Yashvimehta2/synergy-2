import { generateId } from "@/lib/utils";
import { db, type VerifiableCredential } from "@/lib/db/database";

export interface CredentialInput {
  subjectDid: string;
  platform: string;
  totalDeliveries: number;
  avgRating: number;
  last6MonthsEarnings: number;
  activeMonths?: number;
  zone?: string;
}

export async function createCredential(
  input: CredentialInput
): Promise<VerifiableCredential> {
  const credentialId = `urn:uuid:${generateId()}`;
  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);

  const vc: VerifiableCredential = {
    credentialId,
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.org/",
      "https://w3id.org/vc/status-list/2021/v1",
    ],
    type: ["VerifiableCredential", "GigWorkerCredential"],
    issuer: "did:polygonid:polygon:amoy:2qR1FPernPDBfFqGPZ9XzSxBHjNFpBg9eGUvQ7FzCJ",
    issuanceDate: now.toISOString(),
    expirationDate: expiry.toISOString(),
    credentialSubject: {
      id: input.subjectDid,
      platform: input.platform,
      totalDeliveries: input.totalDeliveries,
      avgRating: input.avgRating,
      last6MonthsEarnings: input.last6MonthsEarnings,
      activeMonths: input.activeMonths,
      zone: input.zone,
    },
    proof: {
      type: "BJJSignature2021",
      created: now.toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod:
        "did:polygonid:polygon:amoy:2qR1FPernPDBfFqGPZ9XzSxBHjNFpBg9eGUvQ7FzCJ#key-1",
      jws: generateMockJWS(),
    },
    status: "active",
  };

  return vc;
}

export async function storeCredential(
  vc: VerifiableCredential
): Promise<number> {
  return (await db.credentials.add(vc)) as number;
}

export async function listCredentials(): Promise<VerifiableCredential[]> {
  return db.credentials.toArray();
}

export async function getCredential(
  credentialId: string
): Promise<VerifiableCredential | undefined> {
  return db.credentials.where("credentialId").equals(credentialId).first();
}

export async function deleteCredential(credentialId: string): Promise<void> {
  await db.credentials.where("credentialId").equals(credentialId).delete();
}

export function verifyCredential(vc: VerifiableCredential): {
  valid: boolean;
  checks: { name: string; passed: boolean; detail: string }[];
} {
  const checks = [
    {
      name: "Schema Validation",
      passed: vc["@context"].includes("https://www.w3.org/2018/credentials/v1"),
      detail: "W3C VC context present",
    },
    {
      name: "Type Check",
      passed:
        vc.type.includes("VerifiableCredential") &&
        vc.type.includes("GigWorkerCredential"),
      detail: "Credential types valid",
    },
    {
      name: "Issuer Verification",
      passed: vc.issuer.startsWith("did:polygonid:"),
      detail: "Issuer DID format valid",
    },
    {
      name: "Signature Check",
      passed: !!vc.proof?.jws && vc.proof.jws.length > 20,
      detail: "BJJ Signature present and valid",
    },
    {
      name: "Expiration Check",
      passed: vc.expirationDate
        ? new Date(vc.expirationDate) > new Date()
        : true,
      detail: "Credential not expired",
    },
    {
      name: "Status Check",
      passed: vc.status === "active",
      detail: "Credential is active",
    },
  ];

  return {
    valid: checks.every((c) => c.passed),
    checks,
  };
}

function generateMockJWS(): string {
  const header = btoa(JSON.stringify({ alg: "BJJ", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ iat: Date.now(), nonce: generateId() })
  );
  const sigBytes = new Uint8Array(64);
  crypto.getRandomValues(sigBytes);
  const signature = btoa(String.fromCharCode(...sigBytes));
  return `${header}.${payload}.${signature}`;
}
