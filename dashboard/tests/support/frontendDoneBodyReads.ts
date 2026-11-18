// Controllable done-record body answers for frontend-only Recently done
// journeys: hold or fail the next authenticated `done=bodies` ask that names
// a given file, while other files answer from `services.doneBySource`; hold
// every ask naming a record until released, or fail it until restored; and
// record which records the page asked for.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { holdAuthenticatedReadsWhere } from "../holdAuthenticatedReads.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

const doneFolder = ".planning/done/";

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
            path: `${doneFolder}${fileName}`,
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
      asked.push(`${doneFolder}${file}`);
  });
  return () => asked;
}

// Each record in `paths` once, in path order: asking a record again is spared
// by the server (Backend "a later revision asks GitHub only for the record
// whose blob changed", authenticated-read-listed-records.spec.ts).
export const eachRecordOnce = (paths: readonly string[]) =>
  [...new Set(paths)].toSorted();

// Whether a `done=bodies` ask names the record at `path`.
const asksForRecord = (params: URLSearchParams, path: string) =>
  params.get("done") === "bodies" &&
  params.getAll("file").includes(path.replace(doneFolder, ""));

// Every `done=bodies` ask naming the record at `path` waits until the returned
// release. Push the release onto `releases` so afterEach can free a held
// journey that failed.
export function holdDoneRecordReads(
  page: Page,
  path: string,
  releases: (() => void)[],
) {
  return holdAuthenticatedReadsWhere(
    page,
    (params) => asksForRecord(params, path),
    releases,
  );
}

// Every `done=bodies` ask naming the record at `path` fails as unreachable
// until `restore`; `failed` counts the asks failed so far.
export async function failDoneRecordReads(page: Page, path: string) {
  let failing = true;
  let failed = 0;
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      asksForRecord(url.searchParams, path),
    async (route) => {
      if (!failing) {
        await route.fallback();
        return;
      }
      failed += 1;
      await route.abort("failed");
    },
  );
  return {
    failed: () => failed,
    restore: () => {
      failing = false;
    },
  };
}
