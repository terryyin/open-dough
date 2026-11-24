// Controlled failure answers at the authenticated-read service boundary, and
// counts of the page's reads there. Holds use the existing
// holdAuthenticatedReads helpers; successful reads fall through to the owning
// frontend service substitute.
import type { Page } from "@playwright/test";
import {
  authenticatedReadEndpoint,
  revisionStreamAtParameter,
} from "../../src/authenticatedReadRules.ts";
import { fulfillJson } from "./frontendSubstituteAnswers.ts";

// The page's revision checks: a check or its stream.
export const isRevisionCheck = (params: URLSearchParams) =>
  params.has("since") || params.has(revisionStreamAtParameter);

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

// How many reads matching `which` the page has asked of the boundary from now on.
export function countAuthenticatedReads(
  page: Page,
  which: (params: URLSearchParams) => boolean,
) {
  let reads = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === authenticatedReadEndpoint && which(url.searchParams))
      reads += 1;
  });
  return () => reads;
}

// How many reads of one project's published source the page has asked from now on.
export const countProjectReads = (page: Page, source: string) =>
  countAuthenticatedReads(page, (params) => params.get("source") === source);
