// Hold delivery of one real story-review response: the next one, whose
// payload callers inspect, then release in finally and await delivery before
// proceeding; or one story's, released and drained between a journey's
// phases.
import type { APIResponse, Page, Route } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { expect } from "./preparationPage.ts";

export async function holdNextReviewResponse(
  page: Page,
  origin: string,
  endpoint: string,
) {
  let release!: () => void;
  let captured!: (response: APIResponse) => void;
  let delivered!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const ready = new Promise<APIResponse>((resolve) => {
    captured = resolve;
  });
  const delivery = new Promise<void>((resolve) => {
    delivered = resolve;
  });
  let intercepted = false;
  await page.route(`**${endpoint}?*`, async (route) => {
    if (intercepted) {
      await route.continue();
      return;
    }
    intercepted = true;
    const response = await route.fetch({
      headers: { ...route.request().headers(), Origin: origin },
    });
    expect(response.status()).toBe(200);
    captured(response);
    await held;
    await route.fulfill({ response });
    delivered();
  });
  return { ready, release, delivery };
}

// Holds the answer to the page's first review read of the story `identity`;
// every other read passes. `reached` settles once that read is held, its real
// answer fetched. `releaseAndDrain` lets the answer through and waits until
// its delivery ends -- answered, or dropped because the page no longer waits
// for it -- before removing the hold, whether or not the read ever came: call
// it in a `finally`, so that a failing test does not leave the page's
// teardown waiting on a held read.
export async function holdReviewOf(page: Page, identity: string) {
  const reads = `**${storyReviewEndpoint}?**`;
  let reached!: () => void;
  const reachedHold = new Promise<void>((resolve) => {
    reached = resolve;
  });
  let release!: () => void;
  let drained!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const delivery = new Promise<void>((resolve) => {
    drained = resolve;
  });
  let intercepted = false;
  const hold = async (route: Route) => {
    const read = new URL(route.request().url()).searchParams.get("identity");
    if (intercepted || read !== identity) {
      await route.continue();
      return;
    }
    intercepted = true;
    try {
      const response = await route.fetch();
      reached();
      await held;
      await route.fulfill({ response }).catch(() => undefined);
    } finally {
      drained();
    }
  };
  await page.route(reads, hold);
  return {
    reached: reachedHold,
    releaseAndDrain: async () => {
      release();
      if (intercepted) await delivery;
      await page.unroute(reads, hold);
    },
  };
}
