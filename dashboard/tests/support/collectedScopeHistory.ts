// Machine-local evidence and public scoped reads after actual collection.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import type { CiScopeHistory } from "../../src/ciScopeHistory.ts";
import { rawRequest } from "./rawHttp.ts";

export const historyFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/landed-ci-history.json");

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
