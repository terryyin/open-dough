// What establishes nothing about a revision the configured ref names next
// (../../server/pinnedTexts.ts, ../../server/commitsBetween.ts): a revision behind
// or diverged from the one last answered, more commits between than the
// bound, a comparison or commit whose change list is not whole, a story
// branch head, and a dashboard process on another machine home each read as
// before, asking GitHub about the comparison or commits at most once
// (./revisionReuseBoundary.ts).

import { expect, test } from "../../test-support/support/pageTest.ts";
import { everyRepository } from "../../test-support/support/fakeGitHub.ts";
import {
  aheadBy,
  aheadByAnswer,
  compareAnswer,
} from "../../test-support/comparisonAnswers.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { answerFrom } from "../../test-support/revisionReuseAnswers.ts";
import {
  madeBy,
  modified,
  named,
  type Publication,
} from "../../test-support/revisionReuseOrigin.ts";
import { described } from "../../test-support/revisionReuseCalls.ts";
import { revisionReuseBoundary } from "./revisionReuseBoundary.ts";

const origin = makeMe.aProjectRevision;

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse bounds at a newly named revision (development environment)", () => {
  const { read, at, readEverything, asked, publishedAt, movedTo } =
    revisionReuseBoundary();

  for (const status of ["behind", "diverged"] as const) {
    test(`a revision ${status} A reuses nothing on the comparison, asks it once, and keeps listed records' blob reuse`, async () => {
      const pair = status === "behind" ? "6" : "7";
      const [a, b] = [named(`a${pair}`), named(`b${pair}`)];
      const files = origin.labeled(status).please().files;
      const published = await publishedAt(a, files);
      published.compared.set(`${a}...${b}`, () => compareAnswer(status));
      await movedTo(published, a, { revision: b, files });

      expect((await asked(() => readEverything(b))).sort()).toEqual(
        [
          `compare a${pair}...b${pair}`,
          `content ${origin.paths.backlog}@b${pair}`,
          `content ${origin.paths.seed}@b${pair}`,
          `content ${origin.paths.otherSeed}@b${pair}`,
          `content ${origin.paths.plan}@b${pair}`,
          `listing .planning/agents@b${pair}`,
          `content ${origin.paths.settings}@b${pair}`,
          `listing .planning/done@b${pair}`,
        ].sort(),
      );
    });
  }

  test("eleven commits between are beyond the bound: no commit is read and B is read as before", async () => {
    const [a, b] = [named("a8"), named("b8")];
    const files = origin.labeled("eleven").please().files;
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
    expect(calls).toContain(`content ${origin.paths.seed}@b8`);
    expect(calls).toContain("listing .planning/agents@b8");
  });

  test("a commit whose change list GitHub cuts at 300 files establishes nothing, and is asked once", async () => {
    const [a, b] = [named("a9"), named("b9")];
    const files = origin.labeled("three-hundred").please().files;
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
    expect(calls).toContain(`content ${origin.paths.backlog}@b9`);
    expect(calls).toContain(`content ${origin.paths.plan}@b9`);
  });

  test("a comparison naming 300 files establishes nothing: no commit is read, B is read as before, and it is asked once", async () => {
    const [a, b] = [named("3a"), named("3b")];
    const files = origin.labeled("three-hundred-compared").please().files;
    const published = await publishedAt(a, files);
    const merge = madeBy("3c", [modified("src/app.ts")]);
    await movedTo(published, a, { revision: b, files }, [merge]);
    // GitHub's comparison names at most 300 files, so 300 may not be all.
    const many = [...Array(300).keys()].map((n) =>
      modified(`src/generated/${String(n)}.ts`),
    );
    published.compared.set(`${a}...${b}`, (perPage) =>
      aheadByAnswer([merge.sha], perPage, many),
    );

    expect((await asked(() => readEverything(b))).sort()).toEqual(
      [
        "compare 3a...3b",
        `content ${origin.paths.backlog}@3b`,
        `content ${origin.paths.seed}@3b`,
        `content ${origin.paths.otherSeed}@3b`,
        `content ${origin.paths.plan}@3b`,
        "listing .planning/agents@3b",
        `content ${origin.paths.settings}@3b`,
        "listing .planning/done@3b",
      ].sort(),
    );
  });

  test("a story branch plan read at a moved head asks the plan and its commit time only, never a comparison", async () => {
    const [a, b] = [named("ac"), named("bc")];
    const files = origin.labeled("branch").please().files;
    const branch = "story/branch";
    const published = await publishedAt(a, files);
    await movedTo(published, a, { revision: b, files }, [
      madeBy("cc", [modified("src/app.ts")]),
    ]);
    const [head, movedHead] = [named("dc"), named("ec")];
    published.revisions.set(head, { [origin.paths.plan]: "# Plan at head\n" });
    published.revisions.set(movedHead, {
      [origin.paths.plan]: "# Plan moved\n",
    });
    published.branches.set(branch, head);
    const onBranch = (
      at: string,
      path = `&path=${encodeURIComponent(origin.paths.plan)}`,
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
          `&path=${encodeURIComponent(origin.paths.plan)}&committed=last`,
        );
      }),
    ).toEqual([
      `branch ${branch}`,
      `content ${origin.paths.plan}@ec`,
      `commit-list ${origin.paths.plan}@ec`,
    ]);
  });
});

test("a dashboard process restarted on another machine home holds nothing, so B is read in full without a comparison", async () => {
  const [a, b] = [named("af"), named("bf")];
  const files = origin.labeled("restart").please().files;
  const published: Publication = {
    trunk: { revision: a },
    revisions: new Map([
      [a, files],
      [b, files],
    ]),
    branches: new Map(),
    compared: new Map([[`${a}...${b}`, aheadBy([named("cf")])]]),
    made: new Map([[named("cf"), madeBy("cf", [modified("src/app.ts")])]]),
  };
  // What a membership read asked the GitHub behind `server`.
  const membershipAsked = async (server: DashboardServer) => {
    server.github.serve(everyRepository, (call) =>
      Promise.resolve(answerFrom(published, call)),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${origin.paths.sourceId}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    return server.github.calls.map(described);
  };

  const first = await startDashboardServer(developmentBoundary);
  try {
    expect(await membershipAsked(first)).toEqual([
      "ref",
      `content ${origin.paths.backlog}@af`,
    ]);
  } finally {
    await first.close();
  }
  published.trunk.revision = b;
  const restarted = await startDashboardServer(developmentBoundary);
  try {
    expect(await membershipAsked(restarted)).toEqual([
      "ref",
      `content ${origin.paths.backlog}@bf`,
    ]);
  } finally {
    await restarted.close();
  }
});
