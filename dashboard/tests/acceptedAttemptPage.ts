// Observe the next page launch acceptance without following its outcome.
// Call before the action; held/intermediate checks decide when to settle it.
import type { Page } from "@playwright/test";
import { agentAcceptEndpoint } from "../src/agentLaunch.ts";

export async function nextAcceptedAttemptId(page: Page): Promise<string> {
  const response = await page.waitForResponse(
    (response) =>
      response.url().endsWith(agentAcceptEndpoint) &&
      response.request().method() === "POST",
  );
  const accepted = (await response.json()) as { attempt: { id: string } };
  return accepted.attempt.id;
}
