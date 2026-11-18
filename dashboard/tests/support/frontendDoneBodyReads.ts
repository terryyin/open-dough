// Controllable done-record body answers for frontend-only Recently done
// journeys: hold or fail the next authenticated `done=bodies` ask that names
// a given file, while other files answer from `services.doneBySource`; and
// record which records the page asked for.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

export type FrontendDoneBodyReads = {
  readonly hold: (fileName: string) => HeldAnswer;
  readonly failNext: (fileName: string) => void;
};

export async function installFrontendDoneBodyReads(
  page: Page,
  services: FrontendServiceState,
): Promise<FrontendDoneBodyReads> {
  const holds = new Map<string, AnswerHold>();
  const fails = new Set<string>();
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      new URL(url).searchParams.get("done") === "bodies",
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const sourceId = params.get("source") ?? "open-dough";
      const revision = params.get("revision") ?? services.revision;
      const files = params.getAll("file");
      const held = files.map((file) => holds.get(file)).find(Boolean);
      for (const file of files) holds.delete(file);
      const failing = files.find((file) => fails.has(file));
      if (failing !== undefined) fails.delete(failing);
      await answerHeld(held, async () => {
        if (failing !== undefined) {
          await route.abort("failed");
          return;
        }
        const bodies = services.doneBySource[sourceId]?.bodies ?? {};
        await fulfillJson(route, {
          revision,
          records: files.map((fileName) => ({
            path: `.planning/done/${fileName}`,
            text: bodies[fileName] ?? "",
          })),
        });
      });
    },
  );
  return {
    hold: (fileName) => {
      const { held, hold } = holdAnswer(page);
      holds.set(fileName, hold);
      return held;
    },
    failNext: (fileName) => {
      fails.add(fileName);
    },
  };
}

// The Done records the page itself asked for in its `done=bodies` reads, as
// `.planning/done/<file>` paths in asking order.
export function recordDoneRecordsAsked(page: Page) {
  const asked: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname !== authenticatedReadEndpoint ||
      url.searchParams.get("done") !== "bodies"
    )
      return;
    for (const file of url.searchParams.getAll("file"))
      asked.push(`.planning/done/${file}`);
  });
  return () => asked;
}
