import Dexie, { type Table } from "dexie";

// ===== Type Definitions =====
export interface UserProfile {
  id?: number;
  did: string;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Platform {
  id?: number;
  platformId: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  lastSynced?: Date;
  workerId?: string;
  totalDeliveries?: number;
  avgRating?: number;
  totalEarnings?: number;
  activeMonths?: number;
  zone?: string;
}

export interface WorkRecord {
  id?: number;
  platformId: string;
  month: string;
  earnings: number;
  trips: number;
  rating: number;
  hoursWorked: number;
}

export interface VerifiableCredential {
  id?: number;
  credentialId: string;
  "@context": string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    platform: string;
    totalDeliveries: number;
    avgRating: number;
    last6MonthsEarnings: number;
    activeMonths?: number;
    zone?: string;
    [key: string]: unknown;
  };
  proof?: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws?: string;
  };
  status: "active" | "revoked" | "expired";
}

export interface SyncQueueItem {
  id?: number;
  action: string;
  payload: string;
  status: "pending" | "processing" | "completed" | "failed";
  retries: number;
  maxRetries: number;
  createdAt: Date;
  lastAttempt?: Date;
  error?: string;
}

export interface AppSetting {
  id?: number;
  key: string;
  value: string;
}

// ===== Database Class =====
export class GigIDDatabase extends Dexie {
  profiles!: Table<UserProfile>;
  platforms!: Table<Platform>;
  workRecords!: Table<WorkRecord>;
  credentials!: Table<VerifiableCredential>;
  syncQueue!: Table<SyncQueueItem>;
  settings!: Table<AppSetting>;

  constructor() {
    super("GigIDDatabase");

    this.version(1).stores({
      profiles: "++id, did",
      platforms: "++id, platformId, name",
      workRecords: "++id, platformId, month",
      credentials: "++id, credentialId, [credentialSubject.platform]",
      syncQueue: "++id, action, status, createdAt",
      settings: "++id, &key",
    });
  }
}

export const db = new GigIDDatabase();

// ===== Helper Functions =====
export async function getSetting(key: string): Promise<string | undefined> {
  const setting = await db.settings.where("key").equals(key).first();
  return setting?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where("key").equals(key).first();
  if (existing) {
    await db.settings.update(existing.id!, { value });
  } else {
    await db.settings.add({ key, value });
  }
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.profiles.clear(),
    db.platforms.clear(),
    db.workRecords.clear(),
    db.credentials.clear(),
    db.syncQueue.clear(),
  ]);
}
