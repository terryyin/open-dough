// Browser demand for Running Cursor sessions list asks: recognize the
// section's GET, count outstanding / peak / started while a journey runs,
// count the asks the page itself makes, and hold each read until the journey
// answers it.
import type { Page, Request } from "@playwright/test";
import {
  cursorRunnerSessionsEndpoint,
  type RunningCursorSessions,
} from "../../src/cursorRunnerSessions.ts";
import { givePageItsTurns } from "../pageRequestNotes.ts";

export function isCursorSessionsRead(request: Request): boolean {
  return (
    request.method() === "GET" &&
    new URL(request.url()).pathname === cursorRunnerSessionsEndpoint
  );
}

export function trackCursorSessionsDemand(page: Page) {
  let outstanding = 0;
  let peak = 0;
  let started = 0;
  const noteStart = (request: Request) => {
    if (!isCursorSessionsRead(request)) return;
    started += 1;
    outstanding += 1;
    if (outstanding > peak) peak = outstanding;
  };
  const noteEnd = (request: Request) => {
    if (!isCursorSessionsRead(request)) return;
    outstanding = Math.max(0, outstanding - 1);
  };
  page.on("request", noteStart);
  page.on("requestfinished", noteEnd);
  page.on("requestfailed", noteEnd);
  return {
    peak: () => peak,
    started: () => started,
    outstanding: () => outstanding,
  };
}

type CursorSessionsAsks = Window & { cursorSessionsAsked?: number };

// From the page's first script on, the page counts the Running Cursor
// sessions reads it asks for at the moment it calls `fetch`. A count read
// after the page's turns cannot miss an ask Playwright reports late, so it
// bounds a step in which no read may start.
export async function countCursorSessionsAsks(
  page: Page,
): Promise<() => Promise<number>> {
  await page.addInitScript((endpoint) => {
    const noted = window as CursorSessionsAsks;
    noted.cursorSessionsAsked = 0;
    const send = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = new URL(
        input instanceof Request ? input.url : String(input),
        window.location.href,
      );
      const method =
        init?.method ?? (input instanceof Request ? input.method : "GET");
      if (url.pathname === endpoint && method === "GET") {
        noted.cursorSessionsAsked = (noted.cursorSessionsAsked ?? 0) + 1;
      }
      return send(input, init);
    };
  }, cursorRunnerSessionsEndpoint);
  return async () => {
    await givePageItsTurns(page);
    return page.evaluate(
      () => (window as CursorSessionsAsks).cursorSessionsAsked ?? 0,
    );
  };
}

// Holds every Running Cursor sessions read at its route until the journey
// answers it. `nextArrival`, taken before the step that should ask, resolves
// once the next read reaches the route. `releaseAll` answers what is held
// and every later read at once, so nothing is left waiting at teardown.
export async function holdCursorSessionsReads(page: Page) {
  const held: ((answer: RunningCursorSessions) => void)[] = [];
  const awaitingArrival: (() => void)[] = [];
  let releasedWith: RunningCursorSessions | undefined;
  await page.route(
    (url) => url.pathname === cursorRunnerSessionsEndpoint,
    async (route) => {
      if (!isCursorSessionsRead(route.request())) {
        await route.fallback();
        return;
      }
      const answer =
        releasedWith ??
        (await new Promise<RunningCursorSessions>((answered) => {
          held.push(answered);
          for (const arrived of awaitingArrival.splice(0)) arrived();
        }));
      await route.fulfill({ json: answer });
    },
  );
  return {
    held: () => held.length,
    nextArrival: (): Promise<void> =>
      new Promise((arrived) => {
        awaitingArrival.push(arrived);
      }),
    answer: (answer: RunningCursorSessions) => {
      const next = held.shift();
      if (next === undefined) {
        throw new Error("No Running Cursor sessions read is held.");
      }
      next(answer);
    },
    releaseAll: (answer: RunningCursorSessions) => {
      releasedWith = answer;
      for (const next of held.splice(0)) next(answer);
    },
  };
}
