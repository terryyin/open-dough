// What the progressive Recently done journeys
// (./recently-done-progressive-loading.spec.ts,
// ./recently-done-progressive-navigation.spec.ts) publish and keep: a long list
// of done stories and saved Done sessions, one entry an hour apart, newest
// first. The done records are spelled by the shared done-record renderer and
// catalogued by the real backlog CLI's `catalog-done`, run on a scratch copy
// of the project, so the published catalog is the one a project would push.
// This machine keeps the ad hoc Done sessions and a story's nested sessions.
// Nothing here chooses which entries show or which records are read.

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { standaloneSessionName } from "./dashboardPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import { backlog, repository } from "./recentlyDoneRecords.ts";

export { repository };
export const revision = "f7".repeat(20);
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const doneDirectory = ".planning/done";
const backlogCli = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);

const hour = 60 * 60_000;

// One entry of Recently done, by its place in the newest-first list.
export type ProgressiveEntry =
  | {
      readonly place: number;
      readonly kind: "story";
      readonly identity: string;
      readonly title: string;
      readonly path: string;
    }
  | {
      readonly place: number;
      readonly kind: "session";
      readonly title: string;
    };

// The list's name for an entry once its details are known.
export const entryName = (entry: ProgressiveEntry) =>
  entry.kind === "story"
    ? entry.title
    : standaloneSessionName("Ad hoc", entry.title);

// `count` entries, each one hour older than the one before it; the places in
// `sessionsAt` are ad hoc sessions marked done, every other place a done
// story.
export function progressiveEntries(
  count: number,
  sessionsAt: readonly number[],
): ProgressiveEntry[] {
  return [...Array(count).keys()].map((index): ProgressiveEntry => {
    const place = index + 1;
    const label = String(place).padStart(2, "0");
    if (sessionsAt.includes(place)) {
      return { place, kind: "session", title: `Ad hoc work ${label}` };
    }
    const identity = `SEED-2${label}#progressive-${label}`;
    return {
      place,
      kind: "story",
      identity,
      title: `Finish progressive story ${label}`,
      path: `${doneDirectory}/${doneRecordFileName(identity)}`,
    };
  });
}

// The time an entry's completion or launch is placed at, before `now`.
export const placedAt = (now: number, place: number) =>
  new Date(now - place * hour - 30 * 60_000).toISOString();

// The published files: the backlog, each story's done record, the files
// `beside` names by repository path, and the done catalog the real
// `catalog-done` builds from them.
export function publishedWithCatalog(
  now: number,
  entries: readonly ProgressiveEntry[],
  beside: Readonly<Record<string, string>> = {},
): Record<string, string> {
  const project = mkdtempSync(join(tmpdir(), "open-dough-progressive-"));
  try {
    const done = join(project, doneDirectory);
    mkdirSync(done, { recursive: true });
    writeFileSync(join(project, backlogPath), backlog);
    for (const entry of entries) {
      if (entry.kind !== "story") continue;
      writeFileSync(
        join(project, entry.path),
        renderDoneRecord({
          identity: entry.identity,
          title: entry.title,
          completedAt: placedAt(now, entry.place),
          developer: "Terry Yin",
        }),
      );
    }
    for (const [path, text] of Object.entries(beside)) {
      writeFileSync(join(project, path), text);
    }
    if (entries.some(({ kind }) => kind === "story")) {
      execFileSync(
        process.execPath,
        [backlogCli, "catalog-done", "--file", join(project, backlogPath)],
        { stdio: "pipe" },
      );
    }
    const files: Record<string, string> = { [backlogPath]: backlog };
    for (const name of readdirSync(done)) {
      files[`${doneDirectory}/${name}`] = readFileSync(
        join(done, name),
        "utf8",
      );
    }
    return files;
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
}

// Keeps this machine's sessions: each ad hoc entry's session, marked done
// unless its place is among `open`, which Taken then lists instead; for the
// story at `nestedIn`, three of its sessions marked done, each launched long
// before the story was done, which its card holds; and `also`, as given.
export async function keepProgressiveSessions(
  dashboard: DashboardServer,
  now: number,
  entries: readonly ProgressiveEntry[],
  nestedIn?: number,
  {
    open = [],
    also = [],
  }: {
    readonly open?: readonly number[];
    readonly also?: readonly LaunchRecord[];
  } = {},
) {
  const listed = (name: string, launchedAt: string) => {
    const sessionId = dashboard.claudeListsSession({
      name,
      cwd: dashboard.home,
      startedAt: Date.parse(launchedAt),
    });
    return {
      host: "claude" as const,
      sessionId,
      shortId: sessionId.slice(0, 8),
      name,
    };
  };
  const doneAt = new Date(now - 10 * 60_000).toISOString();
  const records: LaunchRecord[] = entries.flatMap((entry): LaunchRecord[] => {
    if (entry.kind === "session") {
      const launchedAt = placedAt(now, entry.place);
      return [
        {
          request: {
            source: "open-dough",
            workflow: "ad-hoc",
            title: entry.title,
            host: "claude",
          },
          session: listed(entry.title, launchedAt),
          launchedAt,
          ...(open.includes(entry.place) ? {} : { doneAt }),
        },
      ];
    }
    if (entry.place !== nestedIn) return [];
    return (["refinement", "execution", "execution"] as const).map(
      (workflow, index) => {
        const launchedAt = placedAt(now, 60 + index);
        return {
          request: {
            source: "open-dough",
            identity: entry.identity,
            title: entry.title,
            workflow,
            host: "claude",
          },
          session: listed(entry.title, launchedAt),
          launchedAt,
          doneAt,
        };
      },
    );
  });
  await keepLaunchRecords(dashboard, [...records, ...also]);
}
