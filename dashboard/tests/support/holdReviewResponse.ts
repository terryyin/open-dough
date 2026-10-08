// Hold delivery of one real story-review response. Callers inspect its
// payload, then release in finally and await delivery before proceeding.
import type { APIResponse, Page } from "@playwright/test";
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
