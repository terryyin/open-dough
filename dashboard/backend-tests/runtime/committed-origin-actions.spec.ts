// A followed committed origin answers Actions reads from an explicit answerer
// without resolving its branch, and otherwise from the branch it follows.
// Git under a dashboard HOME reaching the committed origin's main stays with
// e2e/sessions/agent-completion-attention.spec.ts "Read leaves the session
// open for Done".
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedOrigin } from "../../test-support/committedOrigin.ts";
import { commitOf } from "../../test-support/committedOriginRepo.ts";
import { startFakeGitHub } from "../../test-support/support/fakeGitHub.ts";
import { serveActionsFor } from "../../test-support/support/storyCiComparisonFixture.ts";

vi.mock(import("../../test-support/committedOriginRepo.ts"), async (actual) => {
  const repo = await actual();
  // The origin's refs as data: no Git runs.
  return {
    ...repo,
    commitOf: vi.fn((...[, name]: [string, string]) => refs.get(name)),
  };
});
const refs = new Map<string, string>();
const mainLookups = () =>
  vi.mocked(commitOf).mock.calls.filter(([, at]) => at === "main").length;

test("explicit Actions answers resolve no main; declined and restored answers follow the origin's new main", async () => {
  const repoDir = "/committed-origin";
  const initial = "a".repeat(40);
  const advanced = "b".repeat(40);
  refs.set("main", initial);
  const github = await startFakeGitHub();
  try {
    const committed = await publishCommittedOrigin(github, {
      repoDir,
      repository: "terryyin/open-dough",
      revision: initial,
      follows: true,
    });
    const run = makeMe.aCiRun
      .with({ headSha: initial, databaseId: 17, attempt: 1 })
      .please();
    const served = serveActionsFor(committed, { [initial]: [run] });
    const read = async (route: string) => {
      const response = await fetch(github.url, {
        method: "POST",
        body: `api\0repos/terryyin/open-dough/${route}\0`,
      });
      const framed = await response.text();
      expect(framed.slice(0, 4)).toBe("0\n0\n");
      return JSON.parse(framed.slice(4)) as unknown;
    };

    vi.mocked(commitOf).mockClear();
    await expect(read("actions/workflows/ci.yml")).resolves.toMatchObject({
      path: ".github/workflows/comparison.yml",
    });
    await expect(
      read(`actions/workflows/ci.yml/runs?head_sha=${initial}`),
    ).resolves.toMatchObject({
      workflow_runs: [{ id: 17, head_sha: initial }],
    });
    expect(mainLookups(), "explicit answers resolved no main").toBe(0);

    refs.set("main", advanced);
    served.restoreActions();
    const restoreDeclined = committed.serveActions(() => undefined);
    await expect(read("actions/workflows/ci.yml/runs")).resolves.toMatchObject({
      workflow_runs: [{ head_sha: advanced }],
    });
    expect(mainLookups(), "a declined answer follows main").toBeGreaterThan(0);
    restoreDeclined();
    await expect(read("actions/workflows/ci.yml/runs")).resolves.toMatchObject({
      workflow_runs: [{ head_sha: advanced }],
    });
  } finally {
    await github.close();
  }
});
