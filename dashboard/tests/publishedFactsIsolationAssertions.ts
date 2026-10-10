// Observe the selected publication's cards, detail, assignment provenance, and
// read status. These checks never provide a displayed snapshot to the page.

import type { Page } from "@playwright/test";
import { expect, githubFor } from "./dashboardTest.ts";
import { expectMembership, parts, rosterParts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import {
  contentReads,
  headsCheckArgv,
  headsChecks,
  passTimeUntilChecked,
} from "./autoRefreshJourney.ts";
import { repository } from "./sliceClockRecords.ts";
import {
  canonicalPath,
  factGroupOfPath,
  planPath,
  takenTitle,
  type FactGroup,
  type PublishedFacts,
} from "./publishedFactsIsolation.ts";

export const factCards = (page: Page, facts: PublishedFacts) => ({
  taken: parts(page).taken.getByRole("article", { name: takenTitle }),
  queued: parts(page).backlog.getByRole("article", { name: facts.queuedTitle }),
});

export async function expectHeldGroups(
  page: Page,
  facts: PublishedFacts,
  groups: readonly FactGroup[],
) {
  // Every held file must have reached its raw handler before the switch's
  // request counter starts. One profile does not establish that its sibling's
  // already-started gh process has reached the fake GitHub yet.
  const paths = Object.keys(facts.files)
    .filter((path) => {
      const group = factGroupOfPath(path);
      return group !== undefined && groups.includes(group);
    })
    .sort();
  await expect
    .poll(() =>
      [
        ...new Set(
          githubFor(page).calls.flatMap(({ request }) =>
            request.kind === "content" &&
            request.repository === repository &&
            request.revision === facts.revision &&
            paths.includes(request.path)
              ? [request.path]
              : [],
          ),
        ),
      ].sort(),
    )
    .toEqual(paths);
}

export async function focusCanonical(page: Page, facts: PublishedFacts) {
  const detail = await inspectedDetail(factCards(page, facts).taken);
  const link = detail.getByRole("link", { name: /^Canonical record/ });
  await link.focus();
  return link;
}

// The selected publication's facts, with `pending` groups still unanswered:
// reading as on a first visit, or, while a new revision of the shown project
// is read, showing what `carriedFrom` showed for the same story. A done
// record is pending once the catalog placed it, so it is new to its card.
export async function expectCurrentFacts(
  page: Page,
  facts: PublishedFacts,
  pending: readonly ("preparation" | "done")[] = [],
  carriedFrom?: PublishedFacts,
) {
  const { taken, queued } = factCards(page, facts);
  const { source, problem, status, recentlyDone } = parts(page);
  await expectMembership(page, facts.membership);
  await expect(source).toContainText(facts.revision);
  await expect(status).toHaveText(
    new RegExp(
      `^Published work read at revision ${facts.revision.slice(0, 7)}, retrieved `,
    ),
  );
  await expect(problem).toHaveCount(0);
  await expect(parts(page).notice).toBeEmpty();
  await expect(taken.locator(".card-owner .owner-line")).toContainText(
    `${facts.owner}-chan`,
  );
  await expect(taken.locator(".card-owner")).toContainText(
    `model-at-${facts.label}`,
  );
  await expect(queued.locator(".card-preparing")).toContainText(
    `${facts.preparer}-chan`,
  );
  await expect(queued.locator(".card-preparing")).toContainText(
    `preparer-at-${facts.label}`,
  );
  await expect(
    taken.getByRole("button", { name: "Hide detail" }),
  ).toBeVisible();
  await expect(
    taken.getByRole("link", { name: /^Canonical record/ }),
  ).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${facts.revision}/${canonicalPath}#shared-story`,
  );
  if (pending.includes("preparation") && carriedFrom !== undefined) {
    // The Taken story was shown before; the queued one is new.
    await expect(taken).not.toContainText("Reading preparation…");
    await expect(taken.locator(".story-purpose")).toHaveText(
      carriedFrom.purpose,
    );
    await expect(taken.locator(".card-progress")).toContainText(
      "1 of 2 slices recorded complete",
    );
    await expect(
      taken.getByRole("link", { name: /^Slice plan/ }),
    ).toHaveAttribute(
      "href",
      `https://github.com/${repository}/blob/${carriedFrom.revision}/${planPath}`,
    );
    await expect(queued).toContainText("Reading preparation…");
  } else if (pending.includes("preparation")) {
    await expect(taken).toContainText("Reading preparation…");
    await expect(queued).toContainText("Reading preparation…");
    await expect(taken).toContainText("Reading purpose…");
    await expect(taken.locator(".story-purpose")).toHaveCount(0);
    await expect(taken.locator(".card-progress")).toContainText(
      "Reading plan slices…",
    );
    await expect(taken.getByRole("link", { name: /^Slice plan/ })).toHaveCount(
      0,
    );
  } else {
    await expect(taken.locator(".story-purpose")).toHaveText(facts.purpose);
    await expect(taken).not.toContainText("Reading preparation…");
    await expect(taken.locator(".card-progress")).toContainText(
      `${facts.label === "A" ? 1 : 0} of 2 slices recorded complete`,
    );
    await expect(
      taken.getByRole("link", { name: /^Slice plan/ }),
    ).toHaveAttribute(
      "href",
      `https://github.com/${repository}/blob/${facts.revision}/${planPath}`,
    );
  }
  if (pending.includes("done")) {
    // The done catalog places the story; its record's facts are still owed.
    const placed = recentlyDone.getByRole("article");
    await expect(placed).toHaveCount(1);
    await expect(placed).toHaveAccessibleName(facts.doneIdentity);
    await expect(placed).toContainText("Reading done story…");
    await expect(placed).not.toContainText(facts.developer);
  } else {
    const done = recentlyDone.getByRole("article", { name: facts.doneTitle });
    await expect(done).toContainText(facts.developer);
    await expect(recentlyDone.getByRole("article")).toHaveCount(1);
  }
}

export async function expectNoEarlierFacts(
  page: Page,
  earlier: PublishedFacts,
) {
  const { recentlyDone, stages } = parts(page);
  await expectNoEarlierAssignments(page, earlier);
  await expect(stages.locator(`a[href*="${earlier.revision}"]`)).toHaveCount(0);
  await expect(stages).not.toContainText(earlier.purpose);
  await expect(recentlyDone).not.toContainText(earlier.doneTitle);
}

// Nothing the new revision has already answered shows the earlier one's:
// its source, owners, preparers, and membership.
export async function expectNoEarlierAssignments(
  page: Page,
  earlier: PublishedFacts,
) {
  const { taken, backlog, source } = parts(page);
  await expect(source).not.toContainText(earlier.revision);
  await expect(taken).not.toContainText(`${earlier.owner}-chan`);
  await expect(backlog).not.toContainText(`${earlier.preparer}-chan`);
  await expect(backlog).not.toContainText(earlier.queuedTitle);
}

export async function expectCurrentRoster(page: Page, facts: PublishedFacts) {
  const { opener, roster, member, back } = rosterParts(page);
  await opener(`${facts.owner}-chan`).click();
  await expect(roster).toContainText(
    `profiles published at revision ${facts.revision.slice(0, 7)}`,
  );
  await expect(member(`${facts.owner}-chan`)).toContainText(takenTitle);
  await expect(member(`${facts.owner}-chan`)).toContainText(
    `model-at-${facts.label}`,
  );
  await expect(member(`${facts.preparer}-chan`)).toContainText(
    facts.queuedTitle,
  );
  await expect(member(`${facts.preparer}-chan`)).toContainText(
    `preparer-at-${facts.label}`,
  );
  await back.click();
}

export function expectOnlyProjectAsked(
  page: Page,
  since: number,
  selectedRepository: string,
  revision: string,
) {
  const calls = githubFor(page).calls.slice(since);
  expect(calls.length).toBeGreaterThan(0);
  expect(
    calls.filter(
      ({ request }) =>
        request.kind === "unknown" || request.repository !== selectedRepository,
    ),
  ).toEqual([]);
  expect(
    contentReads(calls).every((read) => read.endsWith(`?ref=${revision}`)),
  ).toBe(true);
}

export async function expectNextProjectCheck(
  page: Page,
  selectedRepository: string,
  known?: string,
) {
  const beforeCheck = githubFor(page).calls.length;
  await passTimeUntilChecked(page);
  expect(
    headsChecks(githubFor(page).calls.slice(beforeCheck)).map(
      ({ argv }) => argv,
    ),
  ).toEqual([headsCheckArgv(known, selectedRepository)]);
}
