// Raw pinned records and independently held GitHub fact groups for arrival and
// failure journeys. Membership and every held request precede release or failure.
// A variant publishes `moreDone` further recent done records beside the one
// every journey reads, all held in the done group.

import type { Page } from "@playwright/test";
import { z } from "zod";
import {
  readStoryDependencies,
  updateStoryDependency,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import { expect, githubFor, pausePageClockAt } from "./dashboardTest.ts";
import { expectMembership, shortRevision, parts } from "./dashboardPage.ts";
import { branchRefAnswer } from "./originAnswers.ts";
import { addedAt } from "./pathHistoryAnswers.ts";
import { describedRevisions } from "./describedRevisions.ts";
import { doneDirectory, executed } from "./recentlyDoneRecords.ts";
import { heldDoneRecords } from "./publishedFactsDoneRecords.ts";
import {
  afterTake,
  clockedFacts,
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
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import {
  holdFactGroupAnswers,
  type FactGroup,
} from "./support/heldFactGroupAnswers.ts";

export type { FactGroup } from "./support/heldFactGroupAnswers.ts";
export { moreDoneTitle } from "./publishedFactsDoneRecords.ts";
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
export const preparer = "Pat Preparer";
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

const preparingStory = makeMe.aBacklogEntry
  .with({
    identity: preparingIdentity,
    href: preparingHref,
    title: preparing,
  })
  .please();
const preparingText = renderStorySection(preparingStory, { goal: purpose });
// The seed prose, with the supplier agreement the dependency writer records.
const withAgreement = z.string().parse(
  updateStoryDependency(preparingText, {
    identity: preparingStory.identity,
    href: preparingStory.href,
    expectedBasis: readStoryDependencies(preparingText, preparingStory.href)
      .basis,
    dependency: makeMe.aSupplierAgreement
      .with({
        supplier: {
          identity: "SEED-091#after-take",
          href: "seeds/SEED-091-clock.md#after-take",
        },
        implementation: "Published preparation contract",
        rationale: "The consumer needs the supplier's canonical contract.",
        condition: "The supplier's contract is integrated and verified.",
        state: "waiting",
      })
      .please(),
  }).source,
);

// The slice clock records (./sliceClockRecords.ts) queuing one more story,
// then that story prepared: planned and assessed Ready, an execution and a
// preparation profile, and `moreDone` further done records beside the one
// every journey reads.
const publishedTrunk = (moreDone: number) =>
  describedRevisions(
    makeMe.aRepository
      .withRevision(
        "clock",
        clockedFacts({
          queued: [preparingStory],
        }),
      )
      .withRevision("prepared", {
        files: {
          ".planning/open-dough.json": "{}\n",
          [preparingPath]: withAgreement,
          [planPath("preparing")]: plan,
        },
        storyStates: [
          {
            identity: preparingStory.identity,
            href: preparingStory.href,
            ...makeMe.aStoryPreparation
              .plannedIn("../slice-plans/091-preparing/PLAN.md")
              .please(),
            assessment: "ready",
          },
        ],
        agentProfiles: [
          makeMe.anAgentProfile
            .executing({
              name: "Akiho",
              identity: "SEED-091#after-take",
              mode: "story-branch",
              branch,
              host: "claude",
            })
            .please(),
          makeMe.anAgentProfile
            .preparing({
              name: "Kirara",
              identity: preparingIdentity,
              host: "codex",
            })
            .please(),
        ],
        doneRecords: heldDoneRecords(moreDone, minutesBefore),
      })
      .please(),
    { clock: revision, prepared: revision },
  ).prepared;

const groupOf = (request: GhRequest): FactGroup | undefined => {
  if (request.kind !== "content") return undefined;
  if (request.path === takenCanonicalPath) return "preparation";
  if (request.path === profilePath("Akiho")) return "profiles";
  if (request.path.startsWith(`${doneDirectory}/`)) return "done";
  return undefined;
};

export async function heldFactGroups(
  page: Page,
  { moreDone = 0 }: { readonly moreDone?: number } = {},
) {
  await pausePageClockAt(page, opened);
  const trunk = publishes({
    revision,
    files: publishedTrunk(moreDone).files,
    // Bound-recovery journeys need every Taken clock answerable so an
    // unrelated unread plan time does not keep scheduling detail recovery
    // after the held preparation gap heals (./sliceClockRecords.ts omits it).
    committed: {
      ...committed,
      [planPath("time-unread")]: minutesBefore(15),
    },
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
  const held = holdFactGroupAnswers((call) => {
    const { request } = call;
    if (request.kind === "branch") {
      return Promise.resolve(branchRefAnswer(branch, branchHead));
    }
    return "revision" in request && request.revision === branchHead
      ? onBranch(call)
      : trunk(call);
  }, groupOf);
  const github = githubFor(page);
  github.serve(repository, held.answer);
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [preparing],
  });
  await expect(parts(page).readRevision).toContainText(shortRevision(revision));
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
    release: held.release,
    fail: (group: FactGroup) => {
      held.release(group, "failure");
    },
  };
}
