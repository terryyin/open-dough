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
  until?: "settled",
) {
  const answer = page.waitForResponse(async (response) => {
    if (new URL(response.url()).pathname !== storyReviewEndpoint) return false;
    if (until === undefined) return true;
    return (
      storyReviewSchema.safeParse(await response.json()).data?.kind !==
      "initial-sync-required"
    );
  });
  await (using === "keyboard" ? control.press("Enter") : control.click());
  return storyReviewSchema.parse(await (await answer).json());
}
