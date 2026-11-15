// A history read that fails leaves every retained session showing as before,
// and the next opening asks again, against a controlled machine read whose
// history answers ask again once. When the page reads the history at all,
// and its gzip-encoded answer, are
// ../../../e2e/sessions/agent-launch-retained-history.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { putFrontendMachine } from "../../tests/support/frontendServiceState.ts";
import { fulfillJson } from "../../tests/support/frontendSubstituteAnswers.ts";
import { sessionDetailsControl } from "../../tests/support/sessionEntryDisclosure.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
  sessionsRevisionHeader,
} from "../../src/machineSessionsRevision.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const isHistoryUrl = (url: URL) =>
  url.pathname === agentLaunchEndpoint &&
  url.searchParams.get(sessionsAudienceParameter) === sessionsHistoryAudience;

test("a failed history read leaves retained sessions as shown and the next opening asks again", async ({
  page,
  frontendServices,
}) => {
  const title = "Retained through a failure";
  const record = makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .adHoc({ instruction: title, title })
        .launchedAt("2026-10-28T09:30:00.000Z")
        .markedDoneAt("2026-10-28T09:55:00.000Z")
        .please(),
    )
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .please();
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer.observing(record).please(),
  );
  // The first history read is told to ask again; later ones answer the
  // retained session in full.
  const asked: (string | undefined)[] = [];
  await page.route(
    (url) => isHistoryUrl(url),
    async (route) => {
      asked.push(route.request().headers()[sessionsRevisionHeader]);
      if (asked.length === 1) {
        await fulfillJson(route, { error: "Ask again." }, 503);
        return;
      }
      await fulfillJson(route, {
        revision: "history-1",
        records: [record],
        attempts: [],
      });
    },
  );
  await pausePageClockAt(page, new Date("2026-10-28T10:00:00.000Z"));
  await openFrontendTakenBacklog(page);
  const entry = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: title });
  const details = sessionDetailsControl(entry);
  const summary = entry.locator(".session-entry-summary");
  await expect(summary).toBeVisible();
  const shown = await summary.textContent();

  await details.click();
  await expect.poll(() => asked).toHaveLength(1);
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await expect(summary).toHaveText(shown ?? "");

  await details.click();
  await expect.poll(() => asked).toEqual([undefined, undefined]);
  await expect(summary).toHaveText(shown ?? "");
});
