// A mounted Done comparison (./comparisonMountPage.ts) whose local CI wall
// time history read answers from retained landings as the server projects
// them at its published landing (../../server/intentCiHistoryRead.ts), in
// the glance shape the Done view asks for (../../server/ciHistoryGlance.ts),
// for the Done glance and reference lifecycle
// (../../frontend-tests/intent/intent-ci-done-glance.spec.ts,
// ../../frontend-tests/intent/intent-ci-done-reference-lifecycle.spec.ts).
import type { Page } from "@playwright/test";
import { doneWallTimeGlanceOf } from "../../server/ciHistoryGlance.ts";
import { doneWallTimeHistoryOf } from "../../server/intentCiHistoryRead.ts";
import { windowedHistory } from "../../server/landedCiMeasuredBuilds.ts";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import type { ComparisonReply } from "./comparisonMountPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { DoneTrunk } from "./doneWallReferenceHistory.ts";

const story = makeMe.aComparedStory.please();
const landed = story.work.revision;

// The mounted story's trunk: eight earlier first-parent revisions, its
// Landed revision, and two later ones.
export const mountedDoneTrunk: DoneTrunk = {
  order: [
    ..."12345678".split("").map((digit) => digit.repeat(40)),
    landed,
    "e".repeat(40),
    "f".repeat(40),
  ],
  endpoint: landed,
  identity: story.identity,
  repository: "/projects/example/.git",
  base: story.answer.storyStart,
};

// Each Done history read answers what `answer` holds when it is read:
// retained landings as the glance read projects them at the Landed revision,
// or a reply.
export async function serveDoneWallTimeHistory(
  page: Page,
  answer: () => ProjectHistory | ComparisonReply,
) {
  const reads = { count: 0 };
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*revision=/,
    async (route) => {
      reads.count += 1;
      const held = answer();
      if ("landings" in held)
        await route.fulfill({
          json: doneWallTimeGlanceOf(
            doneWallTimeHistoryOf(
              windowedHistory(held),
              landed,
              held.trunkOrder,
              "timing-basis",
            ),
          ),
        });
      else await route.fulfill({ status: held.status ?? 200, json: held.json });
    },
  );
  return reads;
}
