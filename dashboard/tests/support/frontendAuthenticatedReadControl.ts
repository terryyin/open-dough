// Controlled failure answers at the authenticated-read service boundary.
// Holds use the existing holdAuthenticatedReads helpers; successful reads fall
// through to the owning frontend service substitute.
import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { fulfillJson } from "./frontendSubstituteAnswers.ts";

type Answer = "pass" | "unreachable" | { body: unknown; status: number };

export async function controlFrontendAuthenticatedRead(
  page: Page,
  which: (params: URLSearchParams) => boolean,
) {
  let answer: Answer = "pass";
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint && which(url.searchParams),
    async (route) => {
      if (answer === "pass") await route.fallback();
      else if (answer === "unreachable") await route.abort("connectionreset");
      else await fulfillJson(route, answer.body, answer.status);
    },
  );
  return {
    pass: () => {
      answer = "pass";
    },
    unreachable: () => {
      answer = "unreachable";
    },
    respond: (body: unknown, status = 200) => {
      answer = { body, status };
    },
  };
}
