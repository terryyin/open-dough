import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";

export const main = "refs/heads/main";
export const deliver = (fixture, base, extra = {}) =>
  fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: base,
    targetRef: main,
    repo: "owner/project",
    ...extra,
  });
export const waitTarget = async (directory, target) =>
  awaitWorkerState(
    directory,
    () =>
      readRevisionCoverage(directory).some(
        (revision) =>
          revision.sha === target.attempt.sha &&
          revision.state === target.attempt.outcome,
      ),
    "actual target result",
  );
