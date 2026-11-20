// Published content and controlled reads for the mounted Intent revision cases.
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  pygardonFeatures,
  type PublishedFiles,
} from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { forgetAnswers } from "../../src/answerMemo.ts";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import { forgetCachedFiles } from "../../src/fileContentCache.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { clearAllTransientFailures } from "../../src/transientRecovery.ts";

const { folder } = pygardonFeatures;
const projectSource = makeMe.aPublishedSource.pygardon.please();

const locationsOf = (files: PublishedFiles): IntentLocations => ({
  status: "configured",
  locations: [
    makeMe.anIntentLocation
      .at(folder)
      .ofKind("gherkin")
      .selecting(
        ...Object.keys(files).filter((file) => file.startsWith(`${folder}/`)),
      )
      .please(),
  ],
});

type HoldOutcome<T> = T | ReadProblem | undefined;
type HeldReads<T> = Map<string, Promise<HoldOutcome<T>>>;

// The source records misses from the real caches as `<what>@<revision>`.
// A hold controls the next read of the requested locations or file only.
export function publishedReadService(
  published: ReadonlyMap<string, PublishedFiles>,
) {
  forgetAnswers();
  forgetCachedFiles();
  clearAllTransientFailures();
  const reads: string[] = [];
  const unexpected: string[] = [];
  const locationsHolds: HeldReads<IntentLocations> = new Map();
  const fileHolds: HeldReads<string> = new Map();
  let held = 0;

  async function answering<T>(
    holds: HeldReads<T>,
    read: string,
    signal: AbortSignal,
  ) {
    reads.push(read);
    const hold = holds.get(read);
    holds.delete(read);
    if (hold !== undefined) held += 1;
    const outcome = await hold;
    signal.throwIfAborted();
    if (outcome instanceof ReadProblem) throw outcome;
    return outcome;
  }

  function unexpectedRead(read: string): never {
    unexpected.push(read);
    throw new ReadProblem(`Unexpected read ${read}`);
  }

  const filesAt = (source: PublishedSource, revision: string) =>
    source.id === projectSource.id ? published.get(revision) : undefined;

  const source: IntentReadSource = {
    async readLocations(project, revision, signal) {
      const read = `locations@${revision}`;
      const files = filesAt(project, revision);
      if (files === undefined) unexpectedRead(read);
      return (
        (await answering(locationsHolds, read, signal)) ?? locationsOf(files)
      );
    },
    async readFile(project, path, revision, signal) {
      const read = `${path}@${revision}`;
      const text = filesAt(project, revision)?.[path];
      if (text === undefined) unexpectedRead(read);
      return (await answering(fileHolds, read, signal)) ?? text;
    },
  };

  function hold<T>(holds: HeldReads<T>, read: string) {
    let settle: (outcome: HoldOutcome<T>) => void = () => {};
    holds.set(
      read,
      new Promise((resolve) => {
        settle = resolve;
      }),
    );
    const release = () => {
      settle(undefined);
    };
    onTestFinished(release);
    return {
      release,
      fail: (problem: ReadProblem) => {
        settle(problem);
      },
      answer: (given: T) => {
        settle(given);
      },
    };
  }

  return {
    source,
    reads,
    unexpected,
    held: () => held,
    holdLocations: (revision: string) =>
      hold(locationsHolds, `locations@${revision}`),
    holdFile: (path: string, revision: string) =>
      hold(fileHolds, `${path}@${revision}`),
  };
}
