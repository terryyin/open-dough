// What establishes nothing about a revision the configured ref names next
// (../server/pinnedTexts.ts, ../server/commitsBetween.ts): a revision behind
// or diverged from the one last answered, more commits between than the
// bound, a commit whose change list is not whole, a story branch head, and a
// restarted dashboard process each read as before, asking GitHub about the
// comparison or commits at most once (./revisionReuseBoundary.ts).

import { expect, test } from "./support/pageTest.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import { aheadByAnswer, compareAnswer } from "./comparisonAnswers.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  answerFrom,
  backlogPath,
  described,
  filesFor,
  madeBy,
  modified,
  named,
  otherSeedPath,
  planPath,
  type Publication,
  seedPath,
  settingsPath,
  sourceId,
} from "./revisionReuseOrigin.ts";
import { revisionReuseBoundary } from "./revisionReuseBoundary.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse bounds at a newly named revision (dev launch mode)", () => {
  const { read, at, readEverything, asked, publishedAt, movedTo } =
    revisionReuseBoundary();

  for (const status of ["behind", "diverged"] as const) {
    test(`a revision ${status} A reuses nothing on the comparison, asks it once, and keeps listed records' blob reuse`, async () => {
      const pair = status === "behind" ? "6" : "7";
      const [a, b] = [named(`a${pair}`), named(`b${pair}`)];
      const files = filesFor(status);
      const published = await publishedAt(a, files);
      published.compared.set(`${a}...${b}`, () => compareAnswer(status));
      await movedTo(published, a, { revision: b, files });

      expect((await asked(() => readEverything(b))).sort()).toEqual(
        [
          `compare a${pair}...b${pair}`,
          `content ${backlogPath}@b${pair}`,
          `content ${seedPath}@b${pair}`,
          `content ${otherSeedPath}@b${pair}`,
          `content ${planPath}@b${pair}`,
          `listing .planning/agents@b${pair}`,
          `content ${settingsPath}@b${pair}`,
          `listing .planning/done@b${pair}`,
        ].sort(),
      );
    });
  }

  test("eleven commits between are beyond the bound: no commit is read and B is read as before", async () => {
    const [a, b] = [named("a8"), named("b8")];
    const files = filesFor("eleven");
    const published = await publishedAt(a, files);
    const eleven = [...Array(11).keys()].map((n) =>
      madeBy(`e${n.toString(16)}`, [modified("src/app.ts")]),
    );
    await movedTo(published, a, { revision: b, files }, eleven);

    const calls = await asked(() => readEverything(b));
    expect(calls.filter((call) => call.startsWith("compare"))).toEqual([
      "compare a8...b8",
    ]);
    expect(calls.filter((call) => call.startsWith("commit"))).toEqual([]);
    expect(calls).toContain(`content ${seedPath}@b8`);
    expect(calls).toContain("listing .planning/agents@b8");
  });

  test("a commit whose change list GitHub cuts at 300 files establishes nothing, and is asked once", async () => {
    const [a, b] = [named("a9"), named("b9")];
    const files = filesFor("three-hundred");
    const published = await publishedAt(a, files);
    const many = [...Array(300).keys()].map((n) =>
      modified(`src/generated/${String(n)}.ts`),
    );
    await movedTo(published, a, { revision: b, files }, [madeBy("c9", many)]);

    const calls = await asked(() => readEverything(b));
    expect(calls.filter((call) => /^(compare|commit) /.test(call))).toEqual([
      "compare a9...b9",
      "commit c9",
    ]);
    expect(calls).toContain(`content ${backlogPath}@b9`);
    expect(calls).toContain(`content ${planPath}@b9`);
  });

  test("a story branch plan read at a moved head asks the plan and its commit time only, never a comparison", async () => {
    const [a, b] = [named("ac"), named("bc")];
    const files = filesFor("branch");
    const branch = "story/branch";
    const published = await publishedAt(a, files);
    await movedTo(published, a, { revision: b, files }, [
      madeBy("cc", [modified("src/app.ts")]),
    ]);
    const [head, movedHead] = [named("dc"), named("ec")];
    published.revisions.set(head, { [planPath]: "# Plan at head\n" });
    published.revisions.set(movedHead, { [planPath]: "# Plan moved\n" });
    published.branches.set(branch, head);
    const onBranch = (
      at: string,
      path = `&path=${encodeURIComponent(planPath)}`,
    ) =>
      read(
        `&revision=${b}&branch=${encodeURIComponent(branch)}&head=${at}${path}`,
      );

    expect((await at(b).backlog()).status).toBe(200);
    expect(
      (await read(`&revision=${b}&branch=${encodeURIComponent(branch)}`)).body,
    ).toMatchObject({ head });
    expect((await onBranch(head)).body).toMatchObject({
      text: "# Plan at head\n",
    });

    published.branches.set(branch, movedHead);
    expect(
      await asked(async () => {
        await read(`&revision=${b}&branch=${encodeURIComponent(branch)}`);
        await onBranch(movedHead);
        await onBranch(
          movedHead,
          `&path=${encodeURIComponent(planPath)}&committed=last`,
        );
      }),
    ).toEqual([
      `branch ${branch}`,
      `content ${planPath}@ec`,
      `commit-list ${planPath}@ec`,
    ]);
  });
});

test("a restarted dashboard process holds nothing, so B is read in full without a comparison", async () => {
  const [a, b] = [named("af"), named("bf")];
  const files = filesFor("restart");
  const published: Publication = {
    trunk: { revision: a },
    revisions: new Map([
      [a, files],
      [b, files],
    ]),
    branches: new Map(),
    compared: new Map([
      [
        `${a}...${b}`,
        (perPage?: number) => aheadByAnswer([named("cf")], perPage),
      ],
    ]),
    made: new Map([[named("cf"), madeBy("cf", [modified("src/app.ts")])]]),
  };
  // What a membership read asked the GitHub behind `server`.
  const membershipAsked = async (server: DashboardServer) => {
    server.github.serve(everyRepository, (call) =>
      Promise.resolve(answerFrom(published, call)),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${sourceId}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    return server.github.calls.map(described);
  };

  const first = await startDashboardServer({ mode: "dev" });
  try {
    expect(await membershipAsked(first)).toEqual([
      "ref",
      `content ${backlogPath}@af`,
    ]);
  } finally {
    await first.close();
  }
  published.trunk.revision = b;
  const restarted = await startDashboardServer({ mode: "dev" });
  try {
    expect(await membershipAsked(restarted)).toEqual([
      "ref",
      `content ${backlogPath}@bf`,
    ]);
  } finally {
    await restarted.close();
  }
});
