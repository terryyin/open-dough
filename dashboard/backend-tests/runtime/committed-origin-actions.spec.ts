import { existsSync, readFileSync } from "node:fs";
import { test as base, expect } from "../../tests/support/preparationPage.ts";
import { publishCommittedOrigin } from "../../tests/committedOrigin.ts";
import { serveActionsFor } from "../../tests/support/storyCiComparisonFixture.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

// This contract opens no application page and starts no dashboard server.
const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  baseURL: async ({}, use) => {
    await use(undefined);
  },
});

test("explicit Actions answers avoid native main lookup while declined and restored answers follow a real push", async ({
  context,
  github,
  origin,
}, testInfo) => {
  const page = await context.newPage();
  const initial = (await origin.originGit("rev-parse", "main")).trim();
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    repository: "terryyin/open-dough",
    revision: initial,
    follows: true,
  });
  const run = makeMe.aCiRun
    .with({ headSha: initial, databaseId: 17, attempt: 1 })
    .please();
  const served = serveActionsFor(committed, { [initial]: [run] });
  const intercepted: string[][] = [];
  served.interceptActions((argv) => {
    intercepted.push([...argv]);
    return undefined;
  });
  const trace = testInfo.outputPath("git-trace.jsonl");
  const priorTrace = process.env["GIT_TRACE2_EVENT"];
  const mainLookups = () =>
    (existsSync(trace) ? readFileSync(trace, "utf8") : "")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { event?: string; argv?: string[] })
      .filter(
        ({ event, argv }) =>
          event === "start" &&
          argv?.includes("rev-parse") &&
          argv.includes("main^{commit}"),
      );
  const read = async (route: string) => {
    const response = await fetch(github.url, {
      method: "POST",
      body: `api\0repos/terryyin/open-dough/${route}\0`,
    });
    const framed = await response.text();
    expect(framed.slice(0, 4)).toBe("0\n0\n");
    return JSON.parse(framed.slice(4)) as unknown;
  };
  process.env["GIT_TRACE2_EVENT"] = trace;
  try {
    await expect(read("actions/workflows/ci.yml")).resolves.toMatchObject({
      path: ".github/workflows/comparison.yml",
    });
    await expect(
      read(`actions/workflows/ci.yml/runs?head_sha=${initial}`),
    ).resolves.toMatchObject({
      workflow_runs: [{ id: 17, head_sha: initial }],
    });
    expect(intercepted).toHaveLength(2);
    expect(mainLookups(), "explicit answers resolved no native main").toEqual(
      [],
    );

    const pushed = await origin.publishRevision({
      message: "Advance published main after explicit Actions answers",
      files: { "after-actions.txt": "published through a real push\n" },
    });
    expect(pushed).not.toBe(initial);
    expect(committed.revision).toBe(pushed);
    await expect(read("commits/main")).resolves.toMatchObject({ sha: pushed });
    await expect(read("git/matching-refs/heads/")).resolves.toContainEqual(
      expect.objectContaining({
        ref: "refs/heads/main",
        object: expect.objectContaining({ sha: pushed }),
      }),
    );

    served.restoreActions();
    const restoreDeclined = committed.serveActions(() => undefined);
    const beforeDeclined = mainLookups().length;
    await expect(read("actions/workflows/ci.yml/runs")).resolves.toMatchObject({
      workflow_runs: [{ head_sha: pushed }],
    });
    expect(mainLookups()).toHaveLength(beforeDeclined + 1);
    restoreDeclined();
    const beforeRestored = mainLookups().length;
    await expect(read("actions/workflows/ci.yml/runs")).resolves.toMatchObject({
      workflow_runs: [{ head_sha: pushed }],
    });
    expect(mainLookups()).toHaveLength(beforeRestored + 1);
  } finally {
    if (priorTrace === undefined) delete process.env["GIT_TRACE2_EVENT"];
    else process.env["GIT_TRACE2_EVENT"] = priorTrace;
    await page.close();
  }
});
