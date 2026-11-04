// Browser demand for Running Cursor sessions list asks: recognize the
// section's GET and count outstanding / peak / started while a journey runs.
import type { Page, Request } from "@playwright/test";
import { cursorRunnerSessionsEndpoint } from "../../src/cursorRunnerSessions.ts";

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
