// Workers waiting on one shared run artifact (../../test-support/support/runArtifacts.ts)
// see its one preparation complete, fail or be interrupted. A controlled
// build stands in for the app build and the server bundle, which share this
// coordinator; the real builds under concurrent runs are
// Distribution/tests/test-runner/dashboard-concurrent-runs.sh's.
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { artifactDemand } from "../../test-support/support/runArtifacts.ts";

const created: string[] = [];
afterEach(() => {
  for (const directory of created.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

// A build the case ends: it holds until released, failed or interrupted.
function controlledBuild() {
  const builds: string[] = [];
  const ends: ((error?: Error) => void)[] = [];
  const artifact = {
    create: () => {
      const directory = mkdtempSync(path.join(tmpdir(), "dough-demand-"));
      created.push(directory);
      return directory;
    },
    prepare: (directory: string, signal: AbortSignal) => {
      builds.push(directory);
      return new Promise<void>((resolve, reject) => {
        ends.push((error) => {
          if (error) reject(error);
          else resolve();
        });
        signal.addEventListener("abort", () => {
          reject(signal.reason as Error);
        });
      });
    },
  };
  const demand = artifactDemand(new Map([["app", artifact]]));
  const end = (error?: Error) => {
    for (const finish of ends) finish(error);
  };
  return { demand, builds, end };
}

type Build = ReturnType<typeof controlledBuild>;

// Two workers waiting on the build, and the one directory it prepares in.
function twoWaiting(build: Build) {
  const waiting = () =>
    build.demand.request("app") ?? Promise.reject(new Error("unregistered"));
  const settled = Promise.allSettled([waiting(), waiting()]);
  expect(build.builds).toHaveLength(1);
  return { settled, directory: build.builds[0] ?? "" };
}

test("two waiting workers receive one completed build's directory", async () => {
  const build = controlledBuild();
  const { settled, directory } = twoWaiting(build);

  build.end();
  const [first, second] = await settled;

  expect(first).toEqual({ status: "fulfilled", value: directory });
  expect(second).toEqual(first);
  expect(existsSync(directory)).toBe(true);
});

const endings: { outcome: string; ending: (build: Build) => Promise<void> }[] =
  [
    {
      outcome: "fails",
      ending: (build) => {
        build.end(new Error("the build failed"));
        return Promise.resolve();
      },
    },
    { outcome: "is interrupted", ending: (build) => build.demand.close() },
  ];

test.each(endings)(
  "two waiting workers see the same rejection when one shared build $outcome, leaving no directory",
  async ({ ending }) => {
    const build = controlledBuild();
    const { settled, directory } = twoWaiting(build);

    await ending(build);
    const [first, second] = await settled;

    expect(first.status).toBe("rejected");
    expect(second).toEqual(first);
    expect(existsSync(directory)).toBe(false);
  },
);
