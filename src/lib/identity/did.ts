import { generateId } from "@/lib/utils";

export interface DIDDocument {
  "@context": string[];
  id: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyBase58?: string;
  }[];
  authentication: string[];
}

export async function generateDID(): Promise<{
  did: string;
  privateKey: string;
  document: DIDDocument;
}> {
  const keyId = generateId();
  const keyPair = await generateKeyPair();

  const did = `did:polygonid:polygon:amoy:${keyId}`;

  const document: DIDDocument = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
    ],
    id: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: "Ed25519VerificationKey2020",
        controller: did,
        publicKeyBase58: keyPair.publicKey,
      },
    ],
    authentication: [`${did}#key-1`],
  };

  return {
    did,
    privateKey: keyPair.privateKey,
    document,
  };
}

async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  // Simulate key generation with crypto API
  const keyData = new Uint8Array(32);
  crypto.getRandomValues(keyData);

  const publicKey = arrayToBase58(keyData);

  const privateKeyData = new Uint8Array(64);
  crypto.getRandomValues(privateKeyData);
  const privateKey = arrayToBase58(privateKeyData);

  return { publicKey, privateKey };
}

function arrayToBase58(arr: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  let num = BigInt(0);
  for (const byte of arr) {
    num = num * BigInt(256) + BigInt(byte);
  }
  while (num > 0) {
    result = ALPHABET[Number(num % BigInt(58))] + result;
    num = num / BigInt(58);
  }
  // Handle leading zeros
  for (const byte of arr) {
    if (byte === 0) result = "1" + result;
    else break;
  }
  return result || "1";
}

export function validateDID(did: string): boolean {
  return /^did:polygonid:polygon:amoy:[a-zA-Z0-9-]+$/.test(did);
}
