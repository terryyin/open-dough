import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loginMachine } from "./github-request-login-test-fixtures.mjs";
import {
  endCallsLeftRunning,
  killStandingOwner,
} from "./github-request-owner-test-fixtures.mjs";

// One login's consumers of a `gh` whose job logs wait for `releaseLogs`,
// and how to kill the owner standing for them.
export function replacementMachine(t) {
  const { github, owners, withToken } = loginMachine(t, { holdLogs: true });
  endCallsLeftRunning(github);
  const root = github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT;
  const { consumer } = withToken("ann");
  return {
    github,
    owners,
    consumer,
    killOwner: () => killStandingOwner(root),
    logsAsked: () =>
      github.asked().filter((call) => call.endsWith("/logs")).length,
    // What the standing owner's endpoint directory holds, by file name.
    kept(directory) {
      return Object.fromEntries(
        readdirSync(directory, { withFileTypes: true })
          .filter((entry) => entry.isFile())
          .map(({ name }) => [name, readFileSync(join(directory, name))]),
      );
    },
  };
}
