// Authenticated comparison request accounting and the retained retry control.
import type { Locator, Page } from "@playwright/test";
import {
  authenticatedReadEndpoint,
  readWaitLimitMs,
} from "../../src/authenticatedReadRules.ts";
import { parseRequest } from "./ghRequest.ts";

export function listedHeadSha(argv: readonly string[]): string | undefined {
  const request = parseRequest(argv);
  return request.kind === "actions-runs" && request.headSha !== ""
    ? request.headSha
    : undefined;
}

export const checkAgainOf = (panel: Locator) =>
  panel.getByRole("button", { name: "Check again", exact: true });

const intentOf = (url: string) =>
  url.includes(authenticatedReadEndpoint)
    ? new URL(url).searchParams.get("intent")
    : null;

export async function checkComparisonAgain(page: Page, panel: Locator) {
  const answered = page.waitForResponse(
    (response) => intentOf(response.url()) === "ci-comparison",
    { timeout: readWaitLimitMs + 15_000 },
  );
  await checkAgainOf(panel).click();
  return await answered;
}

// API reads finished by the browser, separate from the upstream provider.
export function watchComparisonReads(page: Page) {
  const finished = { comparison: 0, proof: 0 };
  page.on("requestfinished", (request) => {
    const intent = intentOf(request.url());
    if (intent === "ci-comparison") finished.comparison += 1;
    if (intent === "ci-proof") finished.proof += 1;
  });
  return { finished };
}
