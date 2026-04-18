import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// Background Sync for offline queue
self.addEventListener("sync", (event: ExtendableEvent & { tag?: string }) => {
  if (event.tag === "gigid-sync-queue") {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  // Signal all clients to process their sync queues
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: "PROCESS_SYNC_QUEUE" });
  }
}

serwist.addEventListeners();
