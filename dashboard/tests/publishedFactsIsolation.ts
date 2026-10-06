// Distinct published revisions for observation isolation. Only raw records and
// held GitHub answers are supplied; the built page owns every displayed fact.

import type { Page } from "@playwright/test";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { githubFor } from "./dashboardTest.ts";
import { sharedStoryIdentity } from "./doughnutProject.ts";
import { noConnection } from "./originAnswers.ts";
import { commitAnswerIn } from "./pathHistoryAnswers.ts";
import { doneRecordAt } from "./recentlyDoneRecords.ts";
import { opened, profilePath, repository } from "./sliceClockRecords.ts";
import { publishes, type RepositoryAnswerer } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import {
  holdFactGroupAnswers,
  type FactGroup,
} from "./support/heldFactGroupAnswers.ts";

export {
  factGroups as groups,
  type FactGroup,
} from "./support/heldFactGroupAnswers.ts";
export const revisionA = "e1".repeat(20);
export const revisionB = "e2".repeat(20);
export const takenTitle = "Keep the current published facts";
export const canonicalPath = ".planning/seeds/SEED-777-shared.md";
export const planPath = ".planning/slice-plans/777-facts/PLAN.md";
const doneIdentity = "SEED-779#completed";
const donePath = doneRecordAt(doneIdentity);
const backlogPath = ".planning/PRODUCT-BACKLOG.md";

export function factsAt(revision: string, label: "A" | "B") {
  const owner = label === "A" ? "Akiho" : "Yuma";
  const preparer = label === "A" ? "Kirara" : "Sola";
  const queuedTitle = `Queued membership published at ${label}`;
  const queuedIdentity = `SEED-778#queued-${label.toLowerCase()}`;
  const queuedAnchor = `queued-${label.toLowerCase()}`;
  const purpose = `Canonical purpose published at ${label}.`;
  const doneTitle = `Completed story published at ${label}`;
  const developer = `Developer at ${label}`;
  const files = {
    [backlogPath]: `# Product backlog

## Near-future direction

Direction published at ${label}.

## Taken

- [${takenTitle}](seeds/SEED-777-shared.md#shared-story) — ${sharedStoryIdentity}

## Backlog list

- [${queuedTitle}](seeds/SEED-777-shared.md#${queuedAnchor}) — ${queuedIdentity}
`,
    ".planning/open-dough.json": "{}\n",
    [canonicalPath]: `<a id="shared-story"></a>

### ${takenTitle}

**Identity:** ${sharedStoryIdentity}

**Goal:** ${purpose}

\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/777-facts/PLAN.md"}
\`\`\`

<a id="${queuedAnchor}"></a>

### ${queuedTitle}

**Identity:** ${queuedIdentity}

**Goal:** Queued purpose published at ${label}.
`,
    [planPath]: `# Plan published at ${label}

## Slices

### 1. First slice at ${label}
Type: Behavior
Status: ${label === "A" ? "done" : "planned"}
Proof: Observe the current publication.

### 2. Second slice at ${label}
Type: Behavior
Status: planned
Proof: Observe the current publication.
`,
    [profilePath(owner)]: renderAgentProfile({
      name: owner,
      identity: sharedStoryIdentity,
      mode: "trunk",
      branch: "origin/main",
      host: "codex",
      model: `model-at-${label}`,
    }),
    [profilePath(preparer)]: renderAgentProfile({
      name: preparer,
      identity: queuedIdentity,
      activity: "preparation",
      host: "claude",
      model: `preparer-at-${label}`,
    }),
    [donePath]: renderDoneRecord({
      identity: doneIdentity,
      title: doneTitle,
      developer,
      completedAt: new Date(opened.getTime() - 60_000).toISOString(),
    }),
  };
  return {
    revision,
    label,
    owner,
    preparer,
    purpose,
    queuedTitle,
    doneTitle,
    developer,
    files,
    committed: { [planPath]: new Date(opened.getTime() - 5 * 60_000) },
    membership: { taken: [takenTitle], backlog: [queuedTitle] },
  };
}

export type PublishedFacts = ReturnType<typeof factsAt>;

export function groupOf(request: GhRequest): FactGroup | undefined {
  return request.kind === "content" ? factGroupOfPath(request.path) : undefined;
}

export function factGroupOfPath(path: string): FactGroup | undefined {
  if (path === canonicalPath) return "preparation";
  if (path.startsWith(".planning/agents/")) return "profiles";
  if (path === donePath) return "done";
  return undefined;
}

export function publishFactsOrigin(page: Page) {
  const publications: PublishedFacts[] = [];
  const answers = new Map<string, RepositoryAnswerer>();
  let current: PublishedFacts | undefined;
  githubFor(page).serve(repository, (call) => {
    const { request } = call;
    if (request.kind === "commit") {
      return Promise.resolve(
        commitAnswerIn(publications, request.sha) ?? noConnection,
      );
    }
    const revision =
      "revision" in request ? request.revision : current?.revision;
    const answer = revision === undefined ? undefined : answers.get(revision);
    return answer === undefined ? Promise.resolve(noConnection) : answer(call);
  });
  return {
    push(facts: PublishedFacts, heldGroups: readonly FactGroup[] = []) {
      publications.push(facts);
      current = facts;
      const held = holdFactGroupAnswers(publishes(facts), groupOf, heldGroups);
      answers.set(facts.revision, held.answer);
      return {
        release: held.release,
        releaseAll: held.releaseAll,
      };
    },
  };
}
