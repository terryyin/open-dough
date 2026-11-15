import type { BrowserContext, Page } from "@playwright/test";
import { revisionStreamSlotLockNames } from "../../src/revisionStreamSlot.ts";

function holdRevisionStreamSlots(names: readonly string[]): void {
  for (const name of names) {
    void navigator.locks.request(name, () => new Promise(() => {}));
  }
}

// Other tabs occupy both capped stream slots before the page's scripts run,
// so the real page uses recurring revision checks instead of stream delivery.
export async function preholdRevisionStreamSlots(
  target: Page | BrowserContext,
): Promise<void> {
  await target.addInitScript(
    holdRevisionStreamSlots,
    revisionStreamSlotLockNames(),
  );
}
