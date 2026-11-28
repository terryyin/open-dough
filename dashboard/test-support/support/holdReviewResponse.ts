// Hold delivery of one real story-review response: the next matching one, whose
// payload callers inspect, then release in finally and await delivery before
// proceeding; or a story's, released and drained between a journey's phases.
import type { APIResponse, Page, Route } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { expect } from "./preparationPage.ts";

export async function holdNextReviewResponse(
  page: Page,
  origin: string,
  endpoint: string,
  matches: (query: URLSearchParams) => boolean = () => true,
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
    if (intercepted || !matches(new URL(route.request().url()).searchParams)) {
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

// Hold one story's first review read while letting other reads through.
// `reached` exposes the real response before it reaches the page.
// Call `releaseAndDrain` in finally to drain delivery and remove the hold,
// including when the page has already moved on or never requested the read.
export async function holdStoryReviewOf(
  page: Page,
  origin: string,
  story: string,
) {
  const reads = `**${storyReviewEndpoint}?**`;
  let reached!: (response: APIResponse) => void;
  const reachedHold = new Promise<APIResponse>((resolve) => {
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
    if (intercepted || read !== story) {
      await route.fallback();
      return;
    }
    intercepted = true;
    try {
      const response = await route.fetch({
        headers: { ...route.request().headers(), Origin: origin },
      });
      expect(response.status()).toBe(200);
      reached(response);
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
