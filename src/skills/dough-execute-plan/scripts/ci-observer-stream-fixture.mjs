import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "./watch-ci-test-fixtures.mjs";
import { streamMailboxWorker } from "./ci-mailbox.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";

import {
  guardFixtureProcess,
  waitForFixtureRelease,
} from "./ci-process-lifetime-test-fixtures.mjs";

const state = process.argv[2];
if (!state) throw new Error("Expected a fixture state directory");

guardFixtureProcess(state);

// The wait starts before the announcement, so its first check for the release
// has already run by the time a test sees "first-failure-recorded". A release
// published after that is found by polling, not by that first check.
function waitForRelease(signal) {
  const released = waitForFixtureRelease(
    join(state, "release-second-failure"),
    { signal },
  );
  writeFileSync(join(state, "first-failure-recorded"), "");
  return released;
}

let poll = 0;
const fixtureAbort = new AbortController();
const fakeGitHub = async (args) => {
  if (args[1] === "list") {
    poll += 1;
    return [
      run({
        status: "in_progress",
        conclusion: null,
        createdAt: "2026-09-05T10:00:00Z",
      }),
    ];
  }
  return {
    jobs: [
      {
        databaseId: 101,
        name: "labelled fake-GitHub backend failure",
        conclusion: "failure",
      },
      ...(poll < 2
        ? []
        : [
            {
              databaseId: 102,
              name: "labelled fake-GitHub frontend timeout",
              conclusion: "timed_out",
            },
          ]),
    ],
  };
};

await streamMailboxWorker(
  {
    mode: "execution",
    repo: "fixture/example",
    branch: "main",
    maxDurationMs: 60_000,
  },
  {
    write: (output) => process.stdout.write(output),
    observe: async ({ emit, signal, ...request }) => {
      signal.addEventListener(
        "abort",
        () => fixtureAbort.abort(signal.reason),
        {
          once: true,
        },
      );
      let delivered = 0;
      await watchCiExecution({
        ...request,
        signal: fixtureAbort.signal,
        gh: fakeGitHub,
        sleep: () => waitForRelease(fixtureAbort.signal),
        emit: async (event) => {
          await emit(event);
          delivered += 1;
          if (delivered === 2) fixtureAbort.abort();
        },
      });
    },
  },
);
