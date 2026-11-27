// A failed comparison or commit read is not remembered
// (../../server/pinnedTexts.ts): that read comes from the file reader, and a
// later read asks again and reuses. The backlog at B is answered while a
// comparison is held. Retry-After reports retryAfterSeconds and reads nothing
// for the record.

import { expect, test } from "vitest";
import { readingPathAt } from "../../src/authenticatedReadRules.ts";
import { type CommitRecord } from "../../server/ghCommit.ts";
import { GhFailure } from "../../server/ghFailure.ts";
import { reportedFailure } from "../../server/readFailureMessage.ts";
import {
  agentsDirectory,
  answeredFromFile,
  betweenCommit,
  commitTouching,
  comparisonAnswer,
  doneDirectory,
  hold,
  moved,
  oneComparison,
  paths,
  repository,
  revisionA,
  revisionB,
  source,
} from "./revisionReuseFailureHarness.ts";

async function failedThenReused(
  label: string,
  records: Map<string, CommitRecord>,
  duringFailure: () => Promise<string>,
  duringReuse: () => Promise<string>,
  commitsDuringFailure: readonly string[],
  commitsDuringReuse: readonly string[],
): Promise<void> {
  const { files, account, calls, read } = await moved(label, records);
  account.use(duringFailure);
  expect(await read(paths.backlog)).toBe(files[paths.backlog]);
  expect(await read(paths.seed)).toBe(files[paths.seed]);
  expect(calls).toEqual(answeredFromFile);
  expect(account.compared).toEqual([oneComparison()]);
  expect(account.commits).toEqual(commitsDuringFailure);
  account.use(duringReuse);
  expect(await read(paths.plan)).toBe(files[paths.plan]);
  expect(calls).toEqual(answeredFromFile);
  expect(account.compared).toEqual([oneComparison(), oneComparison()]);
  expect(account.commits).toEqual(commitsDuringReuse);
}

test("a comparison that fails is not remembered: that read is answered from the file reader, and a later read compares again and reuses", async () => {
  await failedThenReused(
    "failing",
    new Map([[betweenCommit, commitTouching(betweenCommit)]]),
    () => Promise.reject(new GhFailure({ kind: "unreachable" })),
    () => Promise.resolve(comparisonAnswer([betweenCommit])),
    [],
    [betweenCommit],
  );
});

test("a commit between that fails to be read is not remembered: that read is answered from the file reader, and a later read asks the commit again and reuses", async () => {
  const records = new Map<string, CommitRecord>();
  await failedThenReused(
    "failing commit",
    records,
    () => Promise.resolve(comparisonAnswer([betweenCommit])),
    () => {
      records.set(betweenCommit, commitTouching(betweenCommit));
      return Promise.resolve(comparisonAnswer([betweenCommit]));
    },
    [betweenCommit],
    [betweenCommit, betweenCommit],
  );
});

test("the backlog at B is answered while the comparison is held, and a burst of reads there shares one comparison and one read of the commit between", async () => {
  const { files, account, calls, read, list, pinned, signal } = await moved(
    "burst",
    new Map([[betweenCommit, commitTouching(betweenCommit)]]),
  );
  const held = hold(account, comparisonAnswer([betweenCommit]));
  const otherSeed = read(paths.otherSeed);
  expect(account.compared).toEqual([oneComparison()]);
  expect(await read(paths.backlog)).toBe(files[paths.backlog]);
  const answers = Promise.all([
    otherSeed,
    read(paths.seed),
    read(paths.plan),
    list(agentsDirectory),
    list(doneDirectory),
  ]);
  expect(account.compared).toEqual([oneComparison()]);
  expect(account.commits).toEqual([]);
  held.release();
  const [otherText, seedText, planText, profiles, done] = await answers;
  expect(otherText).toBe(files[paths.otherSeed]);
  expect(seedText).toBe(files[paths.seed]);
  expect(planText).toBe(files[paths.plan]);
  const listAtA = pinned.lister(source, revisionA, signal);
  expect(profiles).toEqual(await listAtA(agentsDirectory));
  expect(done).toEqual(await listAtA(doneDirectory));
  expect(account.compared).toEqual([oneComparison()]);
  expect(account.commits).toEqual([betweenCommit]);
  expect(calls).toEqual([`${repository} ${paths.backlog}@${revisionB}`]);
});

test("a comparison GitHub refuses with Retry-After leaves the backlog answered, reports the rate limit with retryAfterSeconds, and reads nothing for the record", async () => {
  const { files, account, calls, read } = await moved(
    "limited",
    new Map([[betweenCommit, commitTouching(betweenCommit)]]),
  );
  // comparisonViaGh throws this once Retry-After: 120 has been classified.
  account.use(() =>
    Promise.reject(
      new GhFailure({ kind: "rate-limited", status: 403, waitSeconds: 120 }),
    ),
  );
  expect(await read(paths.backlog)).toBe(files[paths.backlog]);
  expect(account.compared).toEqual([]);
  const error: unknown = await read(paths.seed).then(
    () => undefined,
    (caught: unknown) => caught,
  );
  const reported = reportedFailure(
    error,
    source,
    readingPathAt(paths.seed, revisionB),
  );
  expect(error).toBeInstanceOf(GhFailure);
  expect(reported.retryAfterSeconds).toBe(120);
  expect(reported.message).toContain("GitHub limited the rate");
  expect(calls).toEqual([`${repository} ${paths.backlog}@${revisionB}`]);
  expect(account.compared).toEqual([oneComparison()]);
  expect(account.commits).toEqual([]);
});
