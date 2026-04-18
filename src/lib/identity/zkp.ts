import { generateId } from "@/lib/utils";
import type { VerifiableCredential } from "@/lib/db/database";

export type PredicateType =
  | "INCOME_GREATER_THAN"
  | "RATING_GREATER_THAN"
  | "DELIVERIES_GREATER_THAN"
  | "ACTIVE_MONTHS_GREATER_THAN";

export interface ZKPPredicate {
  type: PredicateType;
  field: string;
  operator: ">" | ">=" | "<" | "<=" | "==" | "!=";
  value: number;
  label: string;
}

export interface ZKProof {
  proofId: string;
  credentialId: string;
  predicate: ZKPPredicate;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  verificationKey: {
    protocol: string;
    curve: string;
    nPublic: number;
    vk_alpha_1: string[];
    vk_beta_2: string[][];
    vk_gamma_2: string[][];
    vk_delta_2: string[][];
  };
  result: boolean;
  generatedAt: string;
  expiresAt: string;
}

export const AVAILABLE_PREDICATES: ZKPPredicate[] = [
  {
    type: "INCOME_GREATER_THAN",
    field: "last6MonthsEarnings",
    operator: ">",
    value: 15000,
    label: "Monthly income > ₹15,000",
  },
  {
    type: "INCOME_GREATER_THAN",
    field: "last6MonthsEarnings",
    operator: ">",
    value: 25000,
    label: "Monthly income > ₹25,000",
  },
  {
    type: "INCOME_GREATER_THAN",
    field: "last6MonthsEarnings",
    operator: ">",
    value: 50000,
    label: "6-month income > ₹50,000",
  },
  {
    type: "RATING_GREATER_THAN",
    field: "avgRating",
    operator: ">",
    value: 4.0,
    label: "Average rating > 4.0",
  },
  {
    type: "RATING_GREATER_THAN",
    field: "avgRating",
    operator: ">",
    value: 4.5,
    label: "Average rating > 4.5",
  },
  {
    type: "DELIVERIES_GREATER_THAN",
    field: "totalDeliveries",
    operator: ">",
    value: 500,
    label: "Total deliveries > 500",
  },
  {
    type: "DELIVERIES_GREATER_THAN",
    field: "totalDeliveries",
    operator: ">",
    value: 1000,
    label: "Total deliveries > 1,000",
  },
  {
    type: "ACTIVE_MONTHS_GREATER_THAN",
    field: "activeMonths",
    operator: ">",
    value: 6,
    label: "Active > 6 months",
  },
  {
    type: "ACTIVE_MONTHS_GREATER_THAN",
    field: "activeMonths",
    operator: ">",
    value: 12,
    label: "Active > 12 months",
  },
];

export async function generateProof(
  credential: VerifiableCredential,
  predicate: ZKPPredicate
): Promise<ZKProof> {
  // Simulate proof generation delay (realistic ~2-4 seconds)
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 2000)
  );

  const fieldValue =
    credential.credentialSubject[predicate.field] as number;
  const result = evaluatePredicate(fieldValue, predicate.operator, predicate.value);

  const now = new Date();
  const expires = new Date(now);
  expires.setHours(expires.getHours() + 24);

  // Generate realistic-looking proof components
  const proof: ZKProof = {
    proofId: `zkp:${generateId()}`,
    credentialId: credential.credentialId,
    predicate,
    proof: {
      pi_a: [generateBigInt(), generateBigInt(), "1"],
      pi_b: [
        [generateBigInt(), generateBigInt()],
        [generateBigInt(), generateBigInt()],
        ["1", "0"],
      ],
      pi_c: [generateBigInt(), generateBigInt(), "1"],
      protocol: "groth16",
      curve: "bn128",
    },
    publicSignals: [
      result ? "1" : "0",
      predicate.value.toString(),
      hashField(predicate.field),
    ],
    verificationKey: {
      protocol: "groth16",
      curve: "bn128",
      nPublic: 3,
      vk_alpha_1: [generateBigInt(), generateBigInt(), "1"],
      vk_beta_2: [
        [generateBigInt(), generateBigInt()],
        [generateBigInt(), generateBigInt()],
        ["1", "0"],
      ],
      vk_gamma_2: [
        [generateBigInt(), generateBigInt()],
        [generateBigInt(), generateBigInt()],
        ["1", "0"],
      ],
      vk_delta_2: [
        [generateBigInt(), generateBigInt()],
        [generateBigInt(), generateBigInt()],
        ["1", "0"],
      ],
    },
    result,
    generatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  return proof;
}

export function verifyProof(proof: ZKProof): {
  valid: boolean;
  expired: boolean;
} {
  const expired = new Date(proof.expiresAt) < new Date();
  return {
    valid: proof.result && !expired,
    expired,
  };
}

export function proofToShareableJSON(proof: ZKProof): string {
  return JSON.stringify({
    proofId: proof.proofId,
    predicate: {
      claim: proof.predicate.label,
      type: proof.predicate.type,
    },
    proof: proof.proof,
    publicSignals: proof.publicSignals,
    result: proof.result,
    generatedAt: proof.generatedAt,
    expiresAt: proof.expiresAt,
    verifier: "GigID v1.0",
  });
}

function evaluatePredicate(
  value: number | undefined,
  operator: string,
  threshold: number
): boolean {
  if (value === undefined || value === null) return false;
  switch (operator) {
    case ">": return value > threshold;
    case ">=": return value >= threshold;
    case "<": return value < threshold;
    case "<=": return value <= threshold;
    case "==": return value === threshold;
    case "!=": return value !== threshold;
    default: return false;
  }
}

function generateBigInt(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let result = BigInt(0);
  for (const b of bytes) {
    result = result * BigInt(256) + BigInt(b);
  }
  return result.toString();
}

function hashField(field: string): string {
  let hash = 0;
  for (let i = 0; i < field.length; i++) {
    const char = field.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString();
}
