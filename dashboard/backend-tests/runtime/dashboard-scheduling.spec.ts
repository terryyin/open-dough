// A group's native projects (../../test-support/support/testFiles.mjs) queue
// E2E Test's serial production chains apart from ordinary specs. Locally the
// chains share one worker, leaving the run's other worker to ordinary work;
// CI keeps the configured concurrency for both.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, expect, test } from "vitest";
import { dashboardTestProjects } from "../../test-support/support/testFiles.mjs";

// A runner directory holding two production chains and two ordinary specs.
const directory = mkdtempSync(path.join(tmpdir(), "dough-scheduling-"));
afterAll(() => {
  rmSync(directory, { recursive: true, force: true });
});
mkdirSync(path.join(directory, "runtime"));
const chains = [
  "runtime/production-watcher-failures.spec.ts",
  "runtime/production-watcher.spec.ts",
];
const ordinary = ["a-ordinary.spec.ts", "runtime/b-ordinary.spec.ts"];
for (const file of [...chains, ...ordinary])
  writeFileSync(path.join(directory, file), "");

function projects(ci: boolean) {
  return dashboardTestProjects(
    pathToFileURL(`${directory}/`),
    undefined,
    { roots: ["."], splitVariable: "UNSET_SPLIT" },
    ci,
  );
}

const matched = (testMatch: RegExp[]) =>
  [...chains, ...ordinary].filter((file) =>
    testMatch.some((pattern) => pattern.test(path.join(directory, file))),
  );

test.each([
  { run: "local", ci: false, chainWorkers: 1 },
  { run: "CI", ci: true, chainWorkers: undefined },
])(
  "$run production chains are queued apart from ordinary work",
  ({ ci, chainWorkers }) => {
    const [deployments, rest] = projects(ci);
    expect(deployments).toMatchObject({ name: "chromium-deployments" });
    expect(Object.keys(deployments ?? {})).not.toContain("dependencies");
    expect(deployments?.workers).toBe(chainWorkers);
    expect(matched(deployments?.testMatch ?? [])).toEqual(chains);
    expect(rest).toEqual({ name: "chromium", testMatch: rest?.testMatch });
    expect(matched(rest?.testMatch ?? [])).toEqual(ordinary);
  },
);
