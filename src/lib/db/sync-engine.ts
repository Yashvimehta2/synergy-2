import { db, type SyncQueueItem } from "./database";

export class SyncEngine {
  private isProcessing = false;

  async enqueue(action: string, payload: unknown): Promise<number> {
    const item: SyncQueueItem = {
      action,
      payload: JSON.stringify(payload),
      status: "pending",
      retries: 0,
      maxRetries: 3,
      createdAt: new Date(),
    };

    const id = await db.syncQueue.add(item);

    if (navigator.onLine) {
      this.processQueue();
    } else {
      this.registerBackgroundSync();
    }

    return id as number;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingItems = await db.syncQueue
        .where("status")
        .anyOf(["pending", "failed"])
        .and((item) => item.retries < item.maxRetries)
        .toArray();

      for (const item of pendingItems) {
        await this.processItem(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      await db.syncQueue.update(item.id!, {
        status: "processing",
        lastAttempt: new Date(),
      });

      const payload = JSON.parse(item.payload);

      switch (item.action) {
        case "CREATE_DID":
          await this.syncCreateDID(payload);
          break;
        case "ISSUE_CREDENTIAL":
          await this.syncIssueCredential(payload);
          break;
        case "CONNECT_PLATFORM":
          await this.syncConnectPlatform(payload);
          break;
        case "GENERATE_PROOF":
          await this.syncGenerateProof(payload);
          break;
        default:
          console.warn(`Unknown sync action: ${item.action}`);
      }

      await db.syncQueue.update(item.id!, { status: "completed" });
    } catch (error) {
      const retries = (item.retries || 0) + 1;
      const backoffMs = Math.min(1000 * Math.pow(2, retries), 30000);

      await db.syncQueue.update(item.id!, {
        status: retries >= item.maxRetries ? "failed" : "pending",
        retries,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (retries < item.maxRetries) {
        setTimeout(() => this.processItem({ ...item, retries }), backoffMs);
      }
    }
  }

  private async syncCreateDID(payload: { did: string }): Promise<void> {
    await fetch("/api/identity/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  private async syncIssueCredential(payload: unknown): Promise<void> {
    await fetch("/api/credentials/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  private async syncConnectPlatform(payload: { platformId: string }): Promise<void> {
    await fetch(`/api/mock/${payload.platformId}`, {
      method: "GET",
    });
  }

  private async syncGenerateProof(payload: unknown): Promise<void> {
    await fetch("/api/identity/proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  registerBackgroundSync(): void {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        (registration as unknown as { sync: { register: (tag: string) => Promise<void> } })
          .sync.register("gigid-sync-queue")
          .catch((err: Error) => {
            console.warn("Background sync registration failed:", err);
          });
      });
    }
  }

  async getPendingCount(): Promise<number> {
    return db.syncQueue
      .where("status")
      .anyOf(["pending", "processing"])
      .count();
  }

  async getFailedItems(): Promise<SyncQueueItem[]> {
    return db.syncQueue.where("status").equals("failed").toArray();
  }

  async retryFailed(): Promise<void> {
    await db.syncQueue
      .where("status")
      .equals("failed")
      .modify({ status: "pending", retries: 0 });
    await this.processQueue();
  }
}

export const syncEngine = new SyncEngine();

// Listen for online events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncEngine.processQueue();
  });
}
