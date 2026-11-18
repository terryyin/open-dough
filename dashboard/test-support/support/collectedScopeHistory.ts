// Machine-local evidence and public scoped reads after actual collection.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import type { CiScopeHistory } from "../../src/ciScopeHistory.ts";
import { rawRequest } from "./rawHttp.ts";

export const historyFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/landed-ci-history.json");

// Leaves the machine's collected history unreadable while `during` runs: a
// real store fault the server's own read meets. `restore` puts back what the
// store held, as it is again once `during` ends either way.
export async function withBrokenCollectedHistory(
  home: string,
  during: (restore: () => void) => Promise<void>,
) {
  const file = historyFile(home);
  const retained = readFileSync(file, "utf8");
  const restore = () => {
    writeFileSync(file, retained, "utf8");
  };
  try {
    writeFileSync(file, "{broken collected history", "utf8");
    await during(restore);
  } finally {
    restore();
  }
}

export function retainedHistory(home: string): ProjectHistory | undefined {
  try {
    return (
      JSON.parse(readFileSync(historyFile(home), "utf8")) as Record<
        string,
        ProjectHistory
      >
    )["open-dough"];
  } catch {
    return undefined;
  }
}

export async function collectedScopeHistory(
  origin: string,
  path: string,
  revision: string,
  through: string,
) {
  const query = new URLSearchParams({
    source: "open-dough",
    intent: "ci-history",
    scope: path,
    revision,
    through,
  });
  const response = await rawRequest({
    url: `${origin}/__authenticated-read?${query}`,
    headers: { Origin: origin },
  });
  return {
    status: response.status,
    body: JSON.parse(response.body) as CiScopeHistory,
  };
}

// A scoped read's answer while the collected history cannot be read: the
// local read failed, and the retry is the developer's.
export function expectUnreadableHistoryAnswer(
  answer: Awaited<ReturnType<typeof collectedScopeHistory>>,
) {
  expect(answer.status).toBe(502);
  expect(answer.body).toMatchObject({
    error:
      "The collected CI history could not be read. Retry the local history read.",
  });
}

// Exercise the real atomic writer with an isolated machine's HOME.
export function writeCollectedHistoryOrder(
  home: string,
  order: readonly string[],
) {
  const storeModule = new URL(
    "../../server/landedCiHistoryStore.ts",
    import.meta.url,
  ).href;
  execFileSync(
    process.execPath,
    [
      "--experimental-transform-types",
      "--input-type=module",
      "-e",
      `import {keepLandedCiOrder} from ${JSON.stringify(storeModule)}; await keepLandedCiOrder('open-dough',JSON.parse(process.argv[1]));`,
      JSON.stringify(order),
    ],
    {
      encoding: "utf8",
      env: { ...process.env, HOME: home, NODE_NO_WARNINGS: "1" },
    },
  );
}
