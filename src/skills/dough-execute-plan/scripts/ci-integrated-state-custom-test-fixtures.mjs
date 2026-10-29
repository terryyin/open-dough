// The installed runnable custom provider (ci-reuse-custom-example.mjs) as the
// project's command adapter for the integrated-state journey. Its target
// attempts come from actually executed, counted covered commands. A recording
// wrapper counts discoveries, fails them while `unavailable` holds, and can
// shape discovery as a Pygardon-like all-branch history (every target attempt
// of every branch, newest first) or as a legacy adapter (no branch, check or
// context). Requests can be held until the journey registers its accepted SHA,
// so startup history is never diagnosed as an unregistered execution.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { installCustomReuseProvider } from "./ci-reuse-custom-test-fixtures.mjs";
import { publishFileAsAnotherWriter } from "./publication-test-fixtures.mjs";

export const customPolicy = { check: "project-checks", context: "push" };

const wrapperSource = ({
  example,
  state,
  requests,
  unavailable,
  hold,
  release,
  shape,
}) => `
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { customAdapterResponse, discoveredAttempts } from ${JSON.stringify(example)};
import { guardFixtureProcess, waitForFixtureRelease } from ${JSON.stringify(new URL("./ci-process-lifetime-test-fixtures.mjs", import.meta.url).href)};
guardFixtureProcess(${JSON.stringify(join(state, ".."))});
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync(${JSON.stringify(requests)}, JSON.stringify(request) + '\\n');
if (existsSync(${JSON.stringify(hold)})) await waitForFixtureRelease(${JSON.stringify(release)});
if (existsSync(${JSON.stringify(unavailable)})) {
  process.stderr.write('custom CI service unavailable');
  process.exit(3);
}
const shape = ${JSON.stringify(shape)};
let response = customAdapterResponse(${JSON.stringify(state)}, request);
if (request.operation === 'discover' && shape === 'all-branch-history') {
  const { entries } = JSON.parse(readFileSync(${JSON.stringify(state)}, 'utf8'));
  response = { attempts: discoveredAttempts(entries
    .filter((entry) => entry.kind === 'target' && entry.repo === request.check.repo)) };
}
if (request.operation === 'discover' && shape === 'legacy')
  response = { attempts: response.attempts.map(({ branch, check, context, ...attempt }) => attempt) };
process.stdout.write(JSON.stringify(response));
`;

// A journey provider (see createIntegratedStateJourney) whose discovery has
// `shape`: "example" (the provider's own), "all-branch-history" or "legacy".
export function customProvider(shape = "example") {
  return async (t, fixture, declared) => {
    const provider = await installCustomReuseProvider(fixture);
    const requests = join(fixture.fixture, "adapter-requests.jsonl");
    const unavailable = join(fixture.fixture, "adapter-unavailable");
    const hold = join(fixture.fixture, "hold-adapter");
    const release = join(fixture.fixture, "release-adapter");
    const wrapper = join(fixture.fixture, "recording-adapter.mjs");
    const example = pathToFileURL(
      join(fixture.skill, "scripts/ci-reuse-custom-example.mjs"),
    ).href;
    writeFileSync(
      wrapper,
      wrapperSource({
        example,
        state: provider.state,
        requests,
        unavailable,
        hold,
        release,
        shape,
      }),
    );
    writeFileSync(
      join(fixture.execution, ".planning/open-dough.json"),
      JSON.stringify({
        ciAdapter: [process.execPath, wrapper],
        ...(declared ? { integratedStateCompletion: declared } : {}),
      }),
    );
    const operations = () =>
      existsSync(requests)
        ? readFileSync(requests, "utf8")
            .trim()
            .split("\n")
            .map((line) => JSON.parse(line).operation)
        : [];
    const releases = [];
    t.after(() => releases.forEach((release) => release()));

    // Schedules `sha`'s target attempt on `ref`; its covered command runs at
    // once, or once released when `held`.
    function schedule(sha, { ref = "main", failed = false, held } = {}) {
      const covered = provider.coveredCommand(sha, failed);
      if (!held) return provider.target(sha, { ref, noPolicy: true, covered });
      const release = join(
        fixture.fixture,
        `release-${sha}-${releases.length}`,
      );
      const blocked = `${release}.mjs`;
      writeFileSync(
        blocked,
        `import { spawnSync } from 'node:child_process';
import { guardFixtureProcess, waitForFixtureRelease } from ${JSON.stringify(new URL("./ci-process-lifetime-test-fixtures.mjs", import.meta.url).href)};
guardFixtureProcess(${JSON.stringify(fixture.fixture)});
await waitForFixtureRelease(${JSON.stringify(release)}, { timeoutMs: 60_000 });
const result = spawnSync(${JSON.stringify(covered[0])}, ${JSON.stringify(covered.slice(1))}, { stdio: 'inherit' });
process.exit(result.status ?? 1);
`,
      );
      // A fixture already removed has ended the held command.
      releases.push(() => {
        if (existsSync(fixture.fixture)) writeFileSync(release, "release\n");
      });
      return provider.target(sha, {
        ref,
        noPolicy: true,
        covered: [process.execPath, blocked],
      });
    }

    // Empty until the provider schedules its first attempt.
    const journal = () =>
      existsSync(provider.state)
        ? JSON.parse(readFileSync(provider.state, "utf8"))
        : { entries: [] };
    return {
      repo: provider.policy.repo,
      polls: () => operations().filter((name) => name === "discover").length,
      holdRequests: () => writeFileSync(hold, ""),
      releaseRequests: () => writeFileSync(release, ""),
      members: {
        provider,
        operations,
        // A completed target attempt of `sha` from its actual covered command.
        async validate(sha, options) {
          const { attempt } = await schedule(sha, options);
          assert.equal(
            attempt.outcome,
            options?.failed ? "failure" : "success",
          );
          return attempt;
        },
        // A target attempt of `sha` left pending until `release()`, which
        // resolves to its completed attempt.
        async holdPending(sha, options) {
          const index = releases.length;
          const running = schedule(sha, { ...options, held: true });
          running.catch(() => undefined);
          const deadline = Date.now() + 15_000;
          while (
            !journal().entries.some(
              (entry) =>
                entry.attempt.sha === sha &&
                entry.attempt.outcome === "pending",
            )
          ) {
            assert.ok(Date.now() < deadline, `pending attempt for ${sha}`);
            await pause(20);
          }
          return {
            async release() {
              releases[index]();
              return (await running).attempt;
            },
          };
        },
        // Another writer publishes `file` on top of the remote `ref`, which
        // the coordinator's checkout has not fetched. `validate({ failed })`
        // then has the provider run the covered command for it in that
        // writer's checkout.
        async publishFromAnotherWriter(file, { ref = "main" } = {}) {
          const checkout = mkdtempSync(join(tmpdir(), "custom-writer-"));
          t.after(() => rmSync(checkout, { recursive: true, force: true }));
          const clone = join(checkout, "clone");
          const sha = await publishFileAsAnotherWriter(
            fixture.origin,
            clone,
            file,
            { branch: ref },
          );
          return {
            sha,
            async validate({ failed = false } = {}) {
              const { attempt } = await provider.target(sha, {
                ref,
                noPolicy: true,
                covered: [
                  "/bin/sh",
                  "-c",
                  'cd "$1" && shift && exec "$@"',
                  "sh",
                  clone,
                  ...provider.coveredCommand(sha, failed),
                ],
              });
              return attempt;
            },
          };
        },
        async validateFromAnotherWriter(file, { ref, failed } = {}) {
          const published = await this.publishFromAnotherWriter(file, { ref });
          return {
            sha: published.sha,
            attempt: await published.validate({ failed }),
          };
        },
        // The provider's discovery as the configured adapter answers it.
        discover(branch = "main") {
          const answered = spawnSync(process.execPath, [wrapper], {
            cwd: fixture.execution,
            input: JSON.stringify({
              operation: "discover",
              check: { repo: provider.policy.repo, branch },
            }),
            encoding: "utf8",
          });
          assert.equal(answered.status, 0, answered.stderr);
          return JSON.parse(answered.stdout);
        },
        setUnavailable: (value) =>
          value
            ? writeFileSync(unavailable, "")
            : rmSync(unavailable, { force: true }),
      },
    };
  };
}
