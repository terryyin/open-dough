import { expect } from "vitest";
import type { Locator } from "vitest/browser";

export async function activateButton(button: Locator) {
  await expect.element(button).toBeVisible();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  (button.element() as HTMLButtonElement).click();
}
