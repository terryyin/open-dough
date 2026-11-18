import type { Frame, Page } from "@playwright/test";
import { endHeldAnswers } from "./frontendSubstituteAnswers.ts";

const inFrame = new Set([
  "evaluate",
  "evaluateHandle",
  "getByLabel",
  "getByRole",
  "getByText",
  "locator",
  "waitForFunction",
]);

// Existing board objects read inside the test frame. Playwright maps their
// locator boxes to page coordinates, where keyboard and native touch operate.
export function mountedPhoneBoardPage(page: Page, frame: Frame) {
  const ownedRoutes: Awaited<ReturnType<Page["route"]>>[] = [];
  const replies = new Set<Promise<unknown>>();
  const register: Page["route"] = async (matcher, handler, options) => {
    const answer: Parameters<Page["route"]>[1] = async (route, request) => {
      const pathname = new URL(request.url()).pathname;
      if (request.frame() !== frame || pathname.startsWith("/__vitest")) {
        await route.fallback();
        return;
      }
      const result: unknown = handler(route, request);
      const reply = Promise.resolve(result);
      replies.add(reply);
      try {
        await reply;
      } finally {
        replies.delete(reply);
      }
    };
    const registration = await page.route(matcher, answer, options);
    ownedRoutes.push(registration);
    return registration;
  };

  const framedPage = new Proxy(page, {
    get(target, name): unknown {
      if (name === "route") return register;
      const owner =
        typeof name === "string" && inFrame.has(name) ? frame : target;
      const member: unknown = Reflect.get(owner, name);
      return typeof member === "function" ? member.bind(owner) : member;
    },
  });

  return {
    framedPage,
    async release() {
      try {
        await endHeldAnswers(framedPage);
      } finally {
        await Promise.all(ownedRoutes.map((route) => route.dispose()));
        await Promise.all(replies);
      }
    },
  };
}
