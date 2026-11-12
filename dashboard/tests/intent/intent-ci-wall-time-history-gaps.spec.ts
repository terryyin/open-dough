// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx) when every landing the history keeps is a
// gap: it says none is measured yet and draws no chart, and lists each gap
// with its reason, as not yet or as never, and the build the CI timing
// comparison's Landed rule named for its landing -- its own cancelled build,
// or the equivalent or later trunk build whose CI proof expired, could not
// be read, was never published or has not been read yet -- linked to its
// run, which a phone reader reaches by keyboard
// (SEED-285#see-landed-ci-wall-time-history). The history is the one this
// machine's dashboards keep, as collection leaves it; collection names those
// builds in ../../backend-tests/intent/landed-ci-history-gaps.spec.ts and
// ../../backend-tests/intent/landed-ci-history-pending-proof.spec.ts. Gaps
// among measured builds are in ./intent-ci-wall-time-history-window.spec.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { expect, test } from "../dashboardTest.ts";
import {
  dayWords,
  evidenceByKeyboard,
  expectLinksByKeyboard,
  historyOf,
  openJudgedCiStatus,
  runLink,
} from "../intentCiHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";

// The day `n` days after Oct 1, at noon, when its landing was recorded.
const day = (n: number) =>
  Date.parse("2026-10-01T12:00:00Z") + n * 24 * 60 * 60_000;
const at = (ms: number) => new Date(ms).toISOString();
const receiptOf = (n: number) =>
  `cccccccc-0000-4000-8000-${String(n).padStart(12, "0")}`;

test("a history whose recorded landings are all gaps says none is measured yet, draws no chart, and lists each gap with its reason and the build it names, each run link reached by keyboard on a phone", async ({
  page,
  dashboard,
}) => {
  // One landing a day, oldest first: CI never built it; its own build was
  // cancelled; a skip whose equivalent build's CI proof expired; a cancelled
  // landing whose later trunk build's CI proof could not be read; a skip
  // whose equivalent build published no CI proof; a skip whose equivalent
  // build's CI proof has not been read yet; and one with no CI run yet.
  const landingOf = (n: number) => ({
    receipt: receiptOf(n),
    revision: `e${String(n)}`.repeat(20),
    receivedAt: at(day(n)),
  });
  await keepLandedCiHistory(
    dashboard.home,
    makeMe.aLandedCiHistory
      // Synthetic retained positions, independent of receipt dates.
      .inTrunkOrder([0, 1, 2, 3, 4, 5, 6].map((n) => landingOf(n).revision))
      .unmeasuredLanding({ ...landingOf(0), reason: "no-build" })
      .unmeasuredLanding({
        ...landingOf(1),
        reason: "cancelled",
        build: { revision: "e1".repeat(20), provenance: "exact", runId: 301 },
      })
      .unmeasuredLanding({
        ...landingOf(2),
        reason: "expired",
        build: {
          revision: "b2".repeat(20),
          provenance: "equivalent",
          runId: 302,
        },
      })
      .unmeasuredLanding({
        ...landingOf(3),
        reason: "unreadable",
        build: { revision: "b3".repeat(20), provenance: "later", runId: 303 },
      })
      .unmeasuredLanding({
        ...landingOf(4),
        reason: "no-proof",
        build: {
          revision: "b4".repeat(20),
          provenance: "equivalent",
          runId: 304,
        },
      })
      .pendingLanding({ ...landingOf(5), waitsFor: "proof", runId: 305 })
      .pendingLanding({ ...landingOf(6), waitsFor: "run" })
      .please(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openJudgedCiStatus(page);
  const shown = historyOf(panel);

  await expect(shown.getByRole("heading")).toHaveText("CI wall time history");
  await expect(shown).toContainText(
    "No dashboard-recorded landings have been measured yet.",
  );
  await expect(shown.getByRole("img")).toHaveCount(0);
  const builds = await evidenceByKeyboard(page, panel);
  const sha = (revision: string) => shortSha(revision.repeat(20));
  await expect(builds.getByRole("listitem")).toHaveText([
    `${dayWords(day(0))} · No build · landed revision ${sha("e0")}`,
    `${dayWords(day(1))} · Cancelled · exact revision ${sha("e1")} · Run 301 · attempt 1`,
    `${dayWords(day(2))} · CI proof expired · reused equivalent ${sha("b2")} for ${sha("e2")} · Run 302 · attempt 1`,
    `${dayWords(day(3))} · CI proof unreadable · later trunk build ${sha("b3")} for ${sha("e3")} · Run 303 · attempt 1`,
    `${dayWords(day(4))} · No CI proof summary · reused equivalent ${sha("b4")} for ${sha("e4")} · Run 304 · attempt 1`,
    `${dayWords(day(5))} · Pending · CI proof not read yet · landed revision ${sha("e5")} · Run 305 · attempt 1`,
    `${dayWords(day(6))} · Pending · no CI run yet · landed revision ${sha("e6")}`,
  ]);
  await expectLinksByKeyboard(
    page,
    builds,
    [301, 302, 303, 304, 305].map(runLink),
  );
  await expectNoSidewaysScrollIn(page, shown);
});
