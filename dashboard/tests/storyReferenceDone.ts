// Published Done facts and semantic references only: the real range decides
// what is shown and read. No local sessions or pre-expanded range are supplied.
import {
  publishedWithCatalog,
  progressiveEntries,
} from "./recentlyDoneProgressive.ts";
import {
  recordDependency,
  publishDependencies,
} from "./storyDependencyFixture.ts";
import { writePlanning } from "./storyReadinessCli.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

export const doneEntries = progressiveEntries(35, []).map((entry) => {
  if (entry.kind !== "story") throw new Error("Expected only Done stories");
  return entry;
});
function entryAt(index: number) {
  const entry = doneEntries[index];
  if (entry === undefined) throw new Error("Missing Done fixture entry");
  return entry;
}
export const nearDone = entryAt(2);
export const farDone = entryAt(26);
export const expiredDone = {
  kind: "story" as const,
  place: 31 * 24,
  identity: "SEED-299#expired",
  title: "Completed outside the retained window",
  path: `.planning/done/${doneRecordFileName("SEED-299#expired")}`,
};
export const unlisted = {
  identity: "SEED-298#unlisted",
  title: "An unlisted story",
};
export const donePathsThrough = (count: number) =>
  doneEntries.slice(0, count).map(({ path }) => path);

export async function publishDoneReferences(
  origin: StartOrigin,
  { omitDestination = false } = {},
) {
  const files = publishedWithCatalog(Date.now(), [
    ...doneEntries.filter((entry) => !omitDestination || entry !== farDone),
    expiredDone,
  ]);
  for (const [path, text] of Object.entries(files)) {
    if (path === ".planning/PRODUCT-BACKLOG.md") continue;
    writePlanning(origin.project, path.replace(/^\.planning\//, ""), text);
  }
  for (const [index, entry] of [
    farDone,
    nearDone,
    expiredDone,
    unlisted,
  ].entries()) {
    const [seed, anchor] = entry.identity.split("#");
    writePlanning(
      origin.project,
      `seeds/${seed}.md`,
      `---\nid: ${seed}\n---\n\n# ${seed}\n\n<a id="${anchor}"></a>\n\n### ${entry.title}\n\n**Identity:** ${entry.identity}\n\nPublished completed outcome.\n`,
    );
    recordDependency(origin, index, "waiting", undefined, {
      identity: entry.identity,
      href: `seeds/${seed}.md#${anchor}`,
    });
  }
  return publishDependencies(origin);
}
