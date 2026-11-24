// The window a project history read answers from this machine's kept landed
// CI history (../../server/intentCiHistoryRead.ts,
// ../../server/landedCiMeasuredBuilds.ts), without collecting: of 35 kept
// measured builds it answers the newest 20 in trunk order with the gaps among
// and after them, and none from before
// (SEED-285#see-landed-ci-wall-time-history example 8). How Project Intent
// shows that window is
// ../../frontend-tests/intent/intent-ci-wall-time-history-evidence.spec.ts; the
// bound collection keeps is ./landed-ci-history-window.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  historyEntries,
  keepHistory,
  machineHome,
} from "../support/landedCiPassInputs.ts";

const dayMs = 24 * 60 * 60_000;
const firstStart = Date.parse("2026-10-01T12:00:00Z");
const startOf = (day: number) => firstStart + day * dayMs;
const at = (ms: number) => new Date(ms).toISOString();
const gapAt = (day: number) => at(startOf(day) + dayMs / 4);
const revisionOf = (day: number) =>
  (day + 1).toString(16).padStart(2, "0").repeat(20);
const receiptOf = (n: number) =>
  `cccccccc-0000-4000-8000-${String(n).padStart(12, "0")}`;

test("of 35 kept measured builds, a history read answers the newest 20 in trunk order with the gaps among and after them, dropping an older gap", async () => {
  // One measured build a day for 35 days; CI never built a landing after
  // day 5's build and another after day 20's; one landing after day 34's is
  // still pending.
  const days = [...Array(35).keys()];
  let history = makeMe.aLandedCiHistory;
  for (const day of days)
    history = history.measuredLanding({
      receipt: receiptOf(day),
      revision: revisionOf(day),
      receivedAt: at(startOf(day)),
      runId: 100 + day,
      startedAt: at(startOf(day)),
      completedAt: at(startOf(day) + 5 * 60_000),
    });
  const older = "e0".repeat(20);
  const among = "e4".repeat(20);
  const after = "e3".repeat(20);
  history = history
    .unmeasuredLanding({
      receipt: receiptOf(90),
      revision: older,
      receivedAt: gapAt(5),
      reason: "no-build",
    })
    .unmeasuredLanding({
      receipt: receiptOf(94),
      revision: among,
      receivedAt: gapAt(20),
      reason: "no-build",
    })
    .pendingLanding({
      receipt: receiptOf(93),
      revision: after,
      receivedAt: gapAt(34),
      waitsFor: "build",
    })
    .inTrunkOrder(
      days.flatMap((day) => [
        revisionOf(day),
        ...(day === 5 ? [older] : []),
        ...(day === 20 ? [among] : []),
        ...(day === 34 ? [after] : []),
      ]),
    );
  const home = machineHome();
  await keepHistory(home, history.please());

  const point = (day: number) => ["point", revisionOf(day)];
  expect(
    (await historyEntries(home)).map(({ kind, revision }) => [kind, revision]),
  ).toEqual([
    ...days.filter((day) => day >= 15 && day <= 20).map(point),
    ["gap", among],
    ...days.filter((day) => day > 20).map(point),
    ["gap", after],
  ]);
});
