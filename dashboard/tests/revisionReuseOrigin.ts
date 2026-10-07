// What GitHub publishes for the specs of the local authenticated read
// boundary's reuse at a revision its configured ref names next
// (./revisionReuseBoundary.ts): every record a project shows at one revision,
// the commits a move of the ref is made by, and one answerer for the
// revisions, the comparisons, and the commits between (./originAnswers.ts,
// ./pathHistoryAnswers.ts).

import type { GhCall } from "./support/fakeGitHub.ts";
import {
  branchRefAnswer,
  commitAnswer,
  headsAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import { directoryListingAnswer, listedFiles } from "./listingAnswers.ts";
import {
  commitListIn,
  madeCommitAnswer,
  type ChangedFile,
  type MadeCommit,
} from "./pathHistoryAnswers.ts";
import { compareAnswer } from "./comparisonAnswers.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const sourceId = "open-dough";
export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const seedPath = ".planning/seeds/SEED-301-reuse.md";
export const otherSeedPath = ".planning/seeds/SEED-302-other.md";
export const newSeedPath = ".planning/seeds/SEED-303-new.md";
export const planPath = ".planning/slice-plans/301-reuse/PLAN.md";
export const profilePath = ".planning/agents/akiho-chan.json";
export const otherProfilePath = ".planning/agents/maki-chan.json";
export const settingsPath = ".planning/open-dough.json";
export const donePath = ".planning/done/SEED-300_first.json";
export const addedDonePath = ".planning/done/SEED-304_added.json";

// Revisions and commits are named by one hex pair; each test uses its own,
// since the boundary remembers what it read while the server runs.
export const named = (pair: string) => pair.repeat(20);

export type Files = Readonly<Record<string, string>>;

export const backlogNaming = (label: string, extra = "") => `# Product backlog

## Taken

- [Reuse ${label}](seeds/SEED-301-reuse.md#reuse) — SEED-301#reuse

## Backlog list

- [Other ${label}](seeds/SEED-302-other.md#other) — SEED-302#other
${extra}`;

export const seedText = (label: string) => `# Reuse fixture ${label}

<a id="reuse"></a>

### Reuse ${label}

**Identity:** SEED-301#reuse
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/301-reuse/PLAN.md"}
\`\`\`
`;

// Every record a project shows at one revision, each text naming `label`, so
// no other test's blob stands in for it.
export function filesFor(label: string): Files {
  return {
    [backlogPath]: backlogNaming(label),
    [seedPath]: seedText(label),
    [otherSeedPath]: `# Other fixture ${label}\n\n<a id="other"></a>\n\n### Other ${label}\n\n**Identity:** SEED-302#other\n`,
    [planPath]: `# Plan ${label}\n`,
    [profilePath]: renderAgentProfile({
      name: "Akiho",
      identity: "SEED-301#reuse",
      mode: "story-branch",
      branch: `story/${label}`,
      host: "claude",
      model: undefined,
    }),
    [otherProfilePath]: renderAgentProfile({
      name: "Maki",
      identity: "SEED-302#other",
      mode: "trunk",
      host: "claude",
      model: undefined,
      branch: "main",
    }),
    [settingsPath]: `{"label":"${label}"}\n`,
    [donePath]: `{"label":"${label}"}\n`,
  };
}

// A commit made by a fixture committer changing `files`.
export const madeBy = (
  pair: string,
  files: readonly ChangedFile[],
): MadeCommit => ({
  sha: named(pair),
  committer: "Fixture Committer",
  files,
});

export const modified = (filename: string): ChangedFile => ({
  filename,
  status: "modified",
});

// What GitHub publishes for one test: the files at each revision, which
// revision the configured ref and each branch name, the answer to each
// comparison by `<base>...<head>` (a pair it does not name is diverged), and
// the commits made, each answered with every file it changed.
export type Publication = {
  // The revision the configured ref names, moved as the ref moves.
  readonly trunk: { revision: string };
  readonly revisions: Map<string, Files>;
  readonly branches: Map<string, string>;
  readonly compared: Map<string, (perPage?: number) => OriginAnswer>;
  readonly made: Map<string, MadeCommit>;
};

export function answerFrom(
  published: Publication,
  { request }: GhCall,
): OriginAnswer {
  switch (request.kind) {
    case "repository":
      return {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ default_branch: "main" }),
      };
    case "ref":
      return commitAnswer(published.trunk.revision);
    case "matching-refs":
      return headsAnswer({
        ...Object.fromEntries(published.branches),
        main: published.trunk.revision,
      });
    case "branch": {
      const head = published.branches.get(request.branch);
      return head === undefined
        ? notFoundAnswer()
        : branchRefAnswer(request.branch, head);
    }
    case "compare": {
      const compared = published.compared.get(
        `${request.base}...${request.head}`,
      );
      return compared?.(request.perPage) ?? compareAnswer("diverged");
    }
    case "commit": {
      const made = published.made.get(request.sha);
      return made === undefined ? noConnection : madeCommitAnswer(made);
    }
    case "content":
    case "listing":
    case "commit-list": {
      const files = published.revisions.get(request.revision);
      if (files === undefined) return noConnection;
      if (request.kind === "listing") {
        return directoryListingAnswer(request.path, listedFiles(files));
      }
      if (request.kind === "commit-list") {
        return (
          commitListIn(
            { files, committed: { [request.path]: new Date() } },
            request.path,
            request.perPage,
          ) ?? noConnection
        );
      }
      const text = files[request.path];
      return text === undefined ? notFoundAnswer() : rawFileAnswer(text);
    }
    case "unknown":
      return noConnection;
  }
}

// Each `gh` call as `<kind> <path>@<revision pair>`, `compare <base
// pair>...<head pair>`, or `commit <pair>`.
export function described({ request }: GhCall): string {
  const pair = (sha: string) => sha.slice(0, 2);
  switch (request.kind) {
    case "content":
    case "listing":
    case "commit-list":
      return `${request.kind} ${request.path}@${pair(request.revision)}`;
    case "compare":
      return `compare ${pair(request.base)}...${pair(request.head)}`;
    case "commit":
      return `commit ${pair(request.sha)}`;
    case "branch":
      return `branch ${request.branch}`;
    default:
      return request.kind;
  }
}
