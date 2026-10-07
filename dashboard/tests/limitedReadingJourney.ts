// The limited-reading journeys (limited-reading-*.spec.ts): a page whose read
// meets GitHub's rate limit says so once, the same way whichever read met it,
// and asks nothing until the time the limit names.
//
// The page, its local read boundary, and the `gh` invocation are the
// production ones; the fake GitHub only publishes records and answers one
// chosen request with a rate limit directing a long wait. The page's clock is
// paused while the server keeps the wait by its own real clock, so the wait
// is never waited out, and a time a page learns from the server is the first
// page's time less the real time passed meanwhile, within a second's
// rounding.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  expectSettledPage,
  parts,
} from "./dashboardPage.ts";
import {
  checksAskedWhilePassing,
  setPageVisibility,
} from "./autoRefreshJourney.ts";
import { isCheck } from "./pageRequestNotes.ts";
import { rateLimitedAnswer } from "./publishedOrigin.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import {
  expectSameResumeTime,
  limitSaid,
  noticedResumeTime,
} from "./limitNotice.ts";
import { backlogPath, repository } from "./limitedReadingRecords.ts";
import { publishes, type RepositoryAnswerer } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";

// GitHub's limit, directing a wait no journey waits out.
export const waitSeconds = 900;
const limited = rateLimitedAnswer(429, { "Retry-After": String(waitSeconds) });

const doughnutTitles = { taken: [], backlog: [doughnutSharedTitle] };

// GitHub's answers from `published`, except that each request `limit` picks
// is refused with the long directed wait -- once every request `after`
// picks has reached GitHub, so those are answered as GitHub answers them.
// Says when, by the real clock, the first refusal was given.
export function limiting(page: Page, published: RepositoryAnswerer) {
  let picked: ((request: GhRequest) => boolean) | undefined;
  let after: ((request: GhRequest) => boolean) | undefined;
  let refusedAt: number | undefined;
  const reached = (wanted: (request: GhRequest) => boolean) =>
    githubFor(page).calls.some(({ request }) => wanted(request));
  const answer: RepositoryAnswerer = async (call) => {
    if (picked?.(call.request) !== true) return published(call);
    while (after !== undefined && !reached(after)) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    refusedAt ??= Date.now();
    return limited;
  };
  return {
    answer,
    limit(
      chosen: (request: GhRequest) => boolean,
      once?: (request: GhRequest) => boolean,
    ) {
      picked = chosen;
      after = once;
    },
    refusedAt: () => refusedAt ?? Number.NaN,
  };
}

// Every request the page sends the local read boundary from now on.
function boundaryRequestsOf(page: Page): string[] {
  const sent: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === authenticatedReadEndpoint) {
      sent.push(request.url());
    }
  });
  return sent;
}

// Opens a second tab of the same browser on Doughnut, read whole.
async function secondTabOnDoughnut(page: Page): Promise<Page> {
  githubFor(page).serve(
    doughnutRepository,
    publishes({
      revision: revisionDoughnut,
      files: { [backlogPath]: doughnutBacklog, ...doughnutRecords },
    }),
  );
  const other = await page.context().newPage();
  await other.goto("/?project=doughnut");
  await expectSettledPage(other, doughnutTitles);
  await expect(parts(other).problem).toHaveCount(0);
  return other;
}

// Opens Open Dough's records, `published`, with GitHub answering through
// `limiting`, after a second tab has read Doughnut whole.
export async function openedBeside(
  page: Page,
  at: Date,
  published: RepositoryAnswerer,
) {
  await pausePageClockAt(page, at);
  const answers = limiting(page, published);
  githubFor(page).serve(repository, answers.answer);
  const other = await secondTabOnDoughnut(page);
  return { answers, other };
}

const doughnutWithheld =
  "GitHub limited the rate of the local GitHub CLI's requests, so main of nerds-odd-e/doughnut was not asked of GitHub.";

// What the first page, `page`, and the second tab, `other`, do while the
// limit the first page met stands until `resumesAt`, page time: the first
// page, hidden and seen again, asks no check; the second tab learns the limit
// from its next check and says the same time while keeping its snapshot; the
// first page, switched to Doughnut and then reloaded, shows nothing read and
// the same time; and as page time passes, both hidden and seen again, neither
// page asks a check. GitHub is asked nothing throughout.
export async function whileTheLimitStands(
  page: Page,
  other: Page,
  resumesAt: number,
  refusedAt: number,
): Promise<void> {
  const github = githubFor(page);
  const asked = github.calls.length;
  const sent = boundaryRequestsOf(page);

  await test.step("the first page, hidden and seen again, asks no check", async () => {
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    expect(await checksAskedWhilePassing(page, 250)).toBe(0);
    expect(sent).toEqual([]);
  });

  await test.step("a second tab showing a complete snapshot learns the limit from its next check, keeps its snapshot, and says the same time", async () => {
    const { source } = parts(other);
    const retrieved = await source.locator("time").getAttribute("datetime");
    const answer = other.waitForResponse((response) => isCheck(response.url()));
    await setPageVisibility(other, "hidden");
    await setPageVisibility(other, "visible");
    await other.clock.runFor(1);
    expect((await answer).status()).toBe(502);
    await expect(parts(other).problem).toContainText(doughnutWithheld);
    await expect(parts(other).problem).toContainText(
      "Automatic checks resume then.",
    );
    await expectSameResumeTime(other, resumesAt, refusedAt);
    await expectSettledPage(other, doughnutTitles);
    await expect(source).toContainText(revisionDoughnut);
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      retrieved ?? "",
    );
  });

  await test.step("selecting another project asks nothing and shows that nothing has been read, with the same limit and time", async () => {
    await parts(page)
      .project.getByRole("radio", { name: "Doughnut", exact: true })
      .check();
    await expectProblemAndNoSnapshot(
      page,
      doughnutWithheld,
      doughnutRepository,
      "Reload the page after that time to read again.",
    );
    expect(await noticedResumeTime(page)).toBe(resumesAt);
    expect(sent).toEqual([]);
  });

  await test.step("a reload asks the boundary once, which asks GitHub nothing, and shows that nothing has been read, with the same limit and time", async () => {
    await page.reload();
    await expectProblemAndNoSnapshot(
      page,
      doughnutWithheld,
      doughnutRepository,
      "Reload the page after that time to read again.",
    );
    await expectSameResumeTime(page, resumesAt, refusedAt);
    expect(sent).toHaveLength(1);
  });

  await test.step("as page time passes, hidden and seen again, neither page asks a check, and GitHub is asked nothing", async () => {
    expect(await checksAskedWhilePassing(other, 60_000)).toBe(0);
    for (const tab of [page, other]) {
      await setPageVisibility(tab, "hidden");
      await setPageVisibility(tab, "visible");
    }
    expect(await checksAskedWhilePassing(other, 60_000)).toBe(0);
    expect(await checksAskedWhilePassing(page, 250)).toBe(0);
    await expect(parts(other).problem).toContainText(limitSaid);
    await expect(parts(page).problem).toContainText(limitSaid);
    expect(github.calls.slice(asked)).toEqual([]);
  });
}
