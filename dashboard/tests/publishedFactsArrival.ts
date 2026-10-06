// Raw pinned records and independently held GitHub fact groups for arrival and
// failure journeys. Membership and every held request precede release or failure.

import type { Page } from "@playwright/test";
import { z } from "zod";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  readStoryState,
  recordStoryState,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { expect, githubFor, pausePageClockAt } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { branchRefAnswer, noConnection } from "./originAnswers.ts";
import { addedAt } from "./pathHistoryAnswers.ts";
import { doneRecordAt, executed } from "./recentlyDoneRecords.ts";
import {
  afterTake,
  backlogPath,
  committed,
  files,
  history,
  justTaken,
  opened,
  planPath,
  profilePath,
  repository,
  revision,
  stories,
} from "./sliceClockRecords.ts";
import { publishes, type RepositoryAnswerer } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";

export type FactGroup = "preparation" | "profiles" | "done";
export const takenCanonicalPath = ".planning/seeds/SEED-091-clock.md";
export const preparing = "Prepare beside independently read work";
const preparingIdentity = "SEED-091#preparing";
export const preparingPath = ".planning/seeds/SEED-091-preparing.md";
const preparingHref = "seeds/SEED-091-preparing.md#preparing";
export const purpose =
  "Make canonical preparation facts useful before profiles answer.";
const plan = files[planPath("after-take")] ?? "";
const branch = "story/available-facts";
const branchHead = "b4".repeat(20);
const donePath = doneRecordAt(executed.identity);
export const preparer = "Pat Preparer";
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

const preparingText = `<a id="preparing"></a>

### ${preparing}

**Identity:** ${preparingIdentity}

**Goal:** ${purpose}

\`\`\`json dough-story-dependencies
${JSON.stringify({
  schemaVersion: 1,
  identity: preparingIdentity,
  dependencies: [
    {
      supplier: {
        identity: "SEED-091#after-take",
        href: "seeds/SEED-091-clock.md#after-take",
      },
      implementation: "Published preparation contract",
      rationale: "The consumer needs the supplier's canonical contract.",
      condition: "The supplier's contract is integrated and verified.",
      state: "waiting",
    },
  ],
})}
\`\`\`
`;
const preparationRequest = {
  identity: preparingIdentity,
  href: preparingHref,
  refinement: "refined",
  approach: "planned",
  plan: "../slice-plans/091-preparing/PLAN.md",
};
const unassessed = z
  .string()
  .parse(
    recordStoryState(preparingText, preparationRequest, { planSource: plan })
      .source,
  );
const assessed = z.string().parse(
  recordStoryState(
    unassessed,
    {
      ...preparationRequest,
      assessment: "ready",
      expectedBasis: readStoryState(unassessed, preparingHref, {
        planSource: plan,
      }).basis,
    },
    { planSource: plan },
  ).source,
);

const groupOf = (request: GhRequest): FactGroup | undefined => {
  if (request.kind !== "content") return undefined;
  if (request.path === takenCanonicalPath) return "preparation";
  if (request.path === profilePath("Akiho")) return "profiles";
  if (request.path === donePath) return "done";
  return undefined;
};

export async function heldFactGroups(page: Page) {
  await pausePageClockAt(page, opened);
  const trunk = publishes({
    revision,
    files: {
      ...files,
      ".planning/open-dough.json": "{}\n",
      [backlogPath]: `${files[backlogPath] ?? ""}- [${preparing}](${preparingHref}) — ${preparingIdentity}\n`,
      [preparingPath]: assessed,
      [planPath("preparing")]: plan,
      [profilePath("Akiho")]: renderAgentProfile({
        name: "Akiho",
        identity: "SEED-091#after-take",
        mode: "story-branch",
        branch,
        host: "claude",
      }),
      [profilePath("Kirara")]: renderAgentProfile({
        name: "Kirara",
        identity: preparingIdentity,
        activity: "preparation",
        host: "codex",
      }),
      [donePath]: renderDoneRecord({
        ...executed,
        completedAt: minutesBefore(60).toISOString(),
        developer: "Terry Yin",
      }),
    },
    committed,
    history: {
      ...history,
      [profilePath("Kirara")]: [
        { ...addedAt(0x22, minutesBefore(20)), committer: preparer },
      ],
    },
  });
  const onBranch = publishes({
    revision: branchHead,
    files: {
      [planPath("after-take")]: plan.replace("Status: done", "Status: planned"),
    },
    committed: { [planPath("after-take")]: minutesBefore(7) },
  });
  const failed = new Set<FactGroup>();
  let answer: RepositoryAnswerer = (call) => {
    const { request } = call;
    const group = groupOf(request);
    if (group !== undefined && failed.has(group)) {
      return Promise.resolve(noConnection);
    }
    if (request.kind === "branch") {
      return Promise.resolve(branchRefAnswer(branch, branchHead));
    }
    return "revision" in request && request.revision === branchHead
      ? onBranch(call)
      : trunk(call);
  };
  const release = new Map<FactGroup, () => void>();
  for (const group of ["preparation", "profiles", "done"] as const) {
    const held = holdingAnswer(answer, (request) => groupOf(request) === group);
    answer = held.answer;
    release.set(group, held.release);
  }
  const github = githubFor(page);
  github.serve(repository, answer);
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [preparing],
  });
  await expect(parts(page).source).toContainText(revision);
  // Every held group has actually reached GitHub through the synthetic gh.
  await expect
    .poll(
      () =>
        new Set(github.calls.flatMap(({ request }) => groupOf(request) ?? []))
          .size,
    )
    .toBe(3);
  const { taken, backlog, recentlyDone, problem } = parts(page);
  return {
    branchCard: taken.getByRole("article", { name: afterTake }),
    trunkCard: taken.getByRole("article", { name: justTaken }),
    queuedCard: backlog.getByRole("article", { name: preparing }),
    doneCard: recentlyDone.getByRole("article", { name: executed.title }),
    problem,
    release: (group: FactGroup) => release.get(group)?.(),
    fail: (group: FactGroup) => {
      failed.add(group);
      release.get(group)?.();
    },
  };
}
