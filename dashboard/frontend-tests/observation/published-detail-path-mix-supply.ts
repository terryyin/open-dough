// Pinned path-mix snapshot and typed detail replies for published-detail
// reachable-record proof. Exact paths match Slice 4's Sources control set.
import { expect } from "vitest";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { renderPublishedBacklog } from "../../../Distribution/tests/support/published-backlog.mjs";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

export const revision = "9b1d4e6a2c8f0735be19d4c6a7f8e9d0c1b2a3f4";
const seedPath = ".planning/seeds/SEED-021-observe-published-story-progress.md";
const correctionPlan =
  ".planning/slice-plans/059-installer-update-report/PLAN.md";
const outsidePlanning = "docs/adrs/0001-ubiquitous-language-accepted.md";
const spacedRootPath = "docs/release notes/2026.md";
export const expectedDetailPaths = [
  seedPath,
  correctionPlan,
  outsidePlanning,
  spacedRootPath,
].sort();

const linked = (
  title: string,
  href: string,
  { identity = href, plan }: { identity?: string; plan?: string } = {},
) => ({
  identity,
  title,
  href,
  ...(plan === undefined ? {} : { plan: { label: "plan", target: plan } }),
});

const linkedBacklog = renderPublishedBacklog({
  direction:
    "Trace each entry to its published source at the inspected revision.",
  taken: [
    linked(
      "Repair the installer's update report",
      "slice-plans/059-installer-update-report/PLAN.md",
    ),
    linked(
      "See the project's published work in a story dashboard",
      "seeds/SEED-021-observe-published-story-progress.md#see-published-work",
      {
        identity: "SEED-021#see-published-work",
        plan: "./slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices",
      },
    ),
  ],
  queued: [
    linked(
      "Follow a record kept outside the planning directory",
      "../docs/adrs/0001-ubiquitous-language-accepted.md#decision",
    ),
    linked(
      "Follow a record named from the repository root",
      "/docs/release%20notes/2026.md",
    ),
    linked(
      "Read the hosting provider's note",
      "https://status.example.com/notes/2026-09?view=full#api",
      { identity: "NOTE-7#api", plan: "http://plans.example.org/note-7" },
    ),
    linked("Reach outside the repository", "../../elsewhere/secret.md#top"),
    linked(
      "Run a script from a link",
      "javascript:document.title='canonical-ran'",
      {
        identity: "HOSTILE-1#x",
        plan: "data:text/html,<script>document.title='plan-ran'</script>",
      },
    ),
    linked("Point at an anchor and no file", "#see-published-work"),
    linked("Walk back to the planning directory", "seeds/..#top"),
    linked("Name a web address without a host", "https://"),
    linked("Spell a path that cannot be decoded", "seeds/%E0%A4%A.md"),
  ],
});

export const ownerIdentity = "SEED-021#see-published-work";
export const profilePath = `.planning/${agentIdentity("Akiho").path}`;
const profileText = renderAgentProfile({
  name: "Akiho",
  identity: ownerIdentity,
  mode: "trunk",
  branch: "origin/main",
  host: "claude",
  model: "claude-opus-5-5",
});
export const sessionRecord = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord.please(),
);
export const additionCommit = "b".repeat(40);

function detailTexts(): Record<string, string> {
  return {
    [seedPath]: `# See published work\n\n<a id="see-published-work"></a>\n`,
    [correctionPlan]: `# Repair the installer's update report\n`,
    [outsidePlanning]: `# Ubiquitous language\n\n<a id="decision"></a>\n`,
    [spacedRootPath]: `# Release notes 2026\n`,
  };
}

export function observationSupplying(partial: {
  readonly sessions?: PublishedObservationReadSource["listPublishedSessions"];
}): {
  readonly reads: PublishedObservationReadSource;
  readonly detailPaths: string[];
  readonly additionPaths: string[];
} {
  const texts = detailTexts();
  const detailPaths: string[] = [];
  const additionPaths: string[] = [];
  const unread = pageReadsSupplying({}).observation;
  const reads: PublishedObservationReadSource = {
    ...unread,
    readSnapshot: () => Promise.resolve({ revision, backlog: linkedBacklog }),
    readDetailFile: (...args) => {
      const path = args[1];
      const at = args[2];
      expect(at).toBe(revision);
      detailPaths.push(path);
      const text = texts[path];
      if (text === undefined) {
        return Promise.reject(
          new ReadProblem(`Unexpected detail path ${path}`),
        );
      }
      return Promise.resolve(text);
    },
    readProfiles: () =>
      Promise.resolve({
        profiles: [{ path: profilePath, text: profileText }],
        settings: undefined,
      }),
    readProfileAddition: (...args) => {
      const path = args[1];
      const at = args[2];
      expect(at).toBe(revision);
      additionPaths.push(path);
      return Promise.resolve({
        commit: additionCommit,
        committerName: "Terry",
        committedAt: "2026-01-15T12:00:00.000Z",
        login: "terryyin",
      });
    },
    readDoneCatalog: () =>
      Promise.resolve({
        status: "catalogued" as const,
        records: [],
        unreadable: [],
      }),
    listPublishedSessions:
      partial.sessions ??
      ((...args) => {
        expect(args[1]).toBe(revision);
        return Promise.resolve([sessionRecord]);
      }),
  };
  return { reads, detailPaths, additionPaths };
}
