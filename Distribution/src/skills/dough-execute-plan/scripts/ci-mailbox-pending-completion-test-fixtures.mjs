// Real observer/completion with one controlled clock across resumable waits.
import { revisionWaitDeadlineMs } from "./ci-mailbox-await.mjs";
import { createRevisionCoverageFixture } from "./ci-revision-coverage-test-fixtures.mjs";

export async function pendingFixture(t, integratedPolicy) {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
    integratedPolicy,
  });
  h.setSnapshot({ attempts: [] });
  const sha = await h.deliver();
  const options = {
    root: h.project,
    storage: h.storage,
    now: () => clock,
    workerLiveness: () => "alive",
  };
  const complete = (extra = {}) =>
    h.mailbox.completeRevision(h.directory, sha, { ...options, ...extra });
  return {
    ...h,
    sha,
    options,
    complete,
    time: () => clock,
    waitForPoll: async () => {
      clock += revisionWaitDeadlineMs;
      await h.advancePoll();
    },
    advance: (ms) => {
      clock += ms;
    },
  };
}
