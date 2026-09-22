// Setup helpers for the private Pygardon readiness journey: load CLI-committed
// revision bytes into the synthetic `gh` control file, and a public neighbor
// origin used only to prove switching away from Pygardon stays usable.

import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";
import { publishMovingOrigin } from "../githubOrigin";
import type { ReadinessRepo } from "../storyReadinessFixture";
import type { PrivateReadServer } from "./privateReadServer";

export const readinessPaths = [
  ".planning/PRODUCT-BACKLOG.md",
  ".planning/seeds/SEED-075-readiness.md",
  ".planning/quick/075-blocked/PLAN.md",
  ".planning/quick/075-ready/PLAN.md",
] as const;

export const openDoughTitle =
  "Open Dough stays readable beside private readiness";
export const openDoughRevision = "a1".repeat(20);

const openDoughBacklog = `# Product backlog

## Taken

## Backlog list

- [${openDoughTitle}](seeds/SEED-900-open-dough.md#queued) — SEED-900#queued
`;

export function gitShow(
  directory: string,
  revision: string,
  filePath: string,
): string {
  return execFileSync(
    "git",
    ["-C", directory, "show", `${revision}:${filePath}`],
    { encoding: "utf8" },
  );
}

export function filesAtRevision(
  directory: string,
  revision: string,
): Record<string, string> {
  const files: Record<string, string> = {};
  for (const filePath of readinessPaths) {
    files[filePath] = gitShow(directory, revision, filePath);
  }
  return files;
}

export function setPygardonRevision(
  server: PrivateReadServer,
  repo: ReadinessRepo,
  revision: string,
): void {
  const backlog = gitShow(
    repo.directory,
    revision,
    ".planning/PRODUCT-BACKLOG.md",
  );
  server.setControl({
    mode: "normal",
    revision,
    backlog,
    files: filesAtRevision(repo.directory, revision),
  });
}

export function runningAt(server: PrivateReadServer): string {
  return server.baseURL.replace("127.0.0.1", "localhost");
}

export async function publishPublicNeighbor(page: Page): Promise<void> {
  const openDough = await publishMovingOrigin(page);
  openDough.push(openDoughRevision, openDoughBacklog);
}

export function contentsPathFromGhArgv(argv: readonly string[]): string {
  const joined = argv.join(" ");
  const match = /\/contents\/([^?\s]+)/.exec(joined);
  if (match === null || match[1] === undefined) {
    throw new Error(`expected contents path in: ${joined}`);
  }
  return decodeURIComponent(match[1]);
}
