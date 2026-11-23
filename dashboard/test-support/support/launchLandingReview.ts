// The review the server answers for any launch's story, read as the page
// receives it.
import type { Locator, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

// The review the server answers once `control` is activated.
export async function reviewAfter(
  page: Page,
  control: Locator,
  using: "mouse" | "keyboard" = "mouse",
) {
  const answer = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await (using === "keyboard" ? control.press("Enter") : control.click());
  return storyReviewSchema.parse(await (await answer).json());
}
