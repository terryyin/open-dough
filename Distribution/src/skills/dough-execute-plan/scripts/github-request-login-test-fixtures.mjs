// One user's machine for tests of GitHub request owners under different
// logins: the instrumented `gh` (`./ci-github-test-fixtures.mjs`) asking as
// whichever fixture login a process holds, and consumer processes holding
// one by a token variable or by what `gh` stores.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";
import { startConsumer } from "./github-request-consumer-test-fixtures.mjs";
import { EndpointBinding } from "./github-request-owner-endpoint.mjs";
import { ownerRecords } from "./github-request-owner-test-fixtures.mjs";

export const log = (job) => [
  "api",
  `repos/owner/repo/actions/jobs/${job}/logs`,
];
export const fixtureToken = (user) => `secret-${user}`;

// `withToken` gives a login by a token variable; `stored`, the one `gh`
// stores, whose `login` switches it for every process using it as
// `gh auth switch` does. `asked` names the jobs whose logs a user's login
// was asked for.
export function loginMachine(t, { holdLogs = false } = {}) {
  const github = instrumentedGithubFixture(t, {
    runs: [],
    attempts: {},
    jobs: [],
    holdLogs,
    log: "the log",
  });
  const consumer = (env) => startConsumer(env, github.teardown);
  const asked = (user) =>
    github
      .calls()
      .filter((call) => call.phase === "asked" && call.user === user)
      .map(({ args }) => args.at(-1).replace(/.*jobs\/(\d+)\/logs/, "$1"));
  return {
    github,
    asked,
    owners: () => ownerRecords(github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT),
    withToken(user) {
      const env = { ...github.env, GH_TOKEN: fixtureToken(user) };
      return { env, consumer: () => consumer(env) };
    },
    stored(user) {
      const directory = join(github.env.CI_GH_FIXTURE, "stored");
      mkdirSync(directory);
      const env = { ...github.env, GH_CONFIG_DIR: directory };
      const login = (next) => {
        const draft = join(directory, "hosts.draft");
        writeFileSync(
          draft,
          `github.com:\n  user: ${next}\n  oauth_token: ${fixtureToken(next)}\n`,
        );
        renameSync(draft, join(directory, "hosts.yml"));
      };
      login(user);
      return { env, login, consumer: () => consumer(env) };
    },
  };
}

// The endpoint directory a process with `env` asks through now.
export const endpointOf = (env) => new EndpointBinding(env).directory();
