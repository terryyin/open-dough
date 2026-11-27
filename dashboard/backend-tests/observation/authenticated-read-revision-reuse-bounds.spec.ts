// What establishes nothing about a revision the configured ref names next
// (../../server/pinnedTexts.ts, ../../server/commitsBetween.ts): a revision behind
// or diverged from the one last answered, more commits between than the
// bound, a comparison or commit whose change list is not whole, a story
// branch head, and a dashboard process on another machine home each read as
// before, asking GitHub about the comparison or commits at most once
// (./revisionReuseBoundary.ts).

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  aheadByAnswer,
  compareAnswer,
} from "../../test-support/comparisonAnswers.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { readAt } from "../../test-support/support/sharedReads.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  advanceReusePublication,
  madeBy,
  modified,
  named,
  reusePublication,
  serveReusePublication,
} from "../../test-support/revisionReuseOrigin.ts";
import { describedExactly } from "../../test-support/revisionReuseCalls.ts";
import { revisionReuseBoundary } from "./revisionReuseBoundary.ts";

const origin = makeMe.aProjectRevision;

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse bounds at a newly named revision (development environment)", () => {
  const { read, at, readEverything, asked, publishedAt, movedTo } =
    revisionReuseBoundary();

  for (const status of ["behind", "diverged"] as const) {
    test(`a revision ${status} A reuses nothing on the comparison, asks it once, and keeps listed records' blob reuse`, async () => {
      const files = origin.labeled(status).please().files;
      const published = await publishedAt(files);
      const { revision: a } = published;
      const b = await movedTo(published, a, { files });
      published.compared.set(`${a}...${b}`, () => compareAnswer(status));

      expect((await asked(() => readEverything(b))).sort()).toEqual(
        [
          `compare ${a}...${b}`,
          `content ${origin.paths.backlog}@${b}`,
          `content ${origin.paths.seed}@${b}`,
          `content ${origin.paths.otherSeed}@${b}`,
          `content ${origin.paths.plan}@${b}`,
          `listing .planning/agents@${b}`,
          `content ${origin.paths.settings}@${b}`,
          `listing .planning/done@${b}`,
        ].sort(),
      );
    });
  }

  test("eleven commits between are beyond the bound: no commit is read and B is read as before", async () => {
    const files = origin.labeled("eleven").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const eleven = [...Array(11).keys()].map((n) =>
      madeBy(`e${n.toString(16)}`, [modified("src/app.ts")]),
    );
    const b = await movedTo(published, a, { files }, eleven);

    const calls = await asked(() => readEverything(b));
    expect(calls.filter((call) => call.startsWith("compare"))).toEqual([
      `compare ${a}...${b}`,
    ]);
    expect(calls.filter((call) => call.startsWith("commit"))).toEqual([]);
    expect(calls).toContain(`content ${origin.paths.seed}@${b}`);
    expect(calls).toContain(`listing .planning/agents@${b}`);
  });

  test("a commit whose change list GitHub cuts at 300 files establishes nothing, and is asked once", async () => {
    const files = origin.labeled("three-hundred").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const many = [...Array(300).keys()].map((n) =>
      modified(`src/generated/${String(n)}.ts`),
    );
    const b = await movedTo(published, a, { files }, [madeBy("c9", many)]);

    const calls = await asked(() => readEverything(b));
    expect(calls.filter((call) => /^(compare|commit) /.test(call))).toEqual([
      `compare ${a}...${b}`,
      `commit ${named("c9")}`,
    ]);
    expect(calls).toContain(`content ${origin.paths.backlog}@${b}`);
    expect(calls).toContain(`content ${origin.paths.plan}@${b}`);
  });

  test("a comparison naming 300 files establishes nothing: no commit is read, B is read as before, and it is asked once", async () => {
    const files = origin.labeled("three-hundred-compared").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const merge = madeBy("3c", [modified("src/app.ts")]);
    const b = await movedTo(published, a, { files }, [merge]);
    // GitHub's comparison names at most 300 files, so 300 may not be all.
    const many = [...Array(300).keys()].map((n) =>
      modified(`src/generated/${String(n)}.ts`),
    );
    published.compared.set(`${a}...${b}`, (perPage) =>
      aheadByAnswer([merge.sha], perPage, many),
    );

    expect((await asked(() => readEverything(b))).sort()).toEqual(
      [
        `compare ${a}...${b}`,
        `content ${origin.paths.backlog}@${b}`,
        `content ${origin.paths.seed}@${b}`,
        `content ${origin.paths.otherSeed}@${b}`,
        `content ${origin.paths.plan}@${b}`,
        `listing .planning/agents@${b}`,
        `content ${origin.paths.settings}@${b}`,
        `listing .planning/done@${b}`,
      ].sort(),
    );
  });

  test("a story branch plan read at a moved head asks the plan and its commit time only, never a comparison", async () => {
    const files = origin.labeled("branch").please().files;
    const branch = "story/branch";
    const published = await publishedAt(files);
    const { revision: a } = published;
    const b = await movedTo(published, a, { files }, [
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
      `content ${origin.paths.plan}@${movedHead}`,
      `commit-list ${origin.paths.plan}@${movedHead}`,
    ]);
  });
});

test("a dashboard process restarted on another machine home holds nothing, so B is read in full without a comparison", async () => {
  const files = origin.labeled("restart").please().files;
  const published = reusePublication(files);
  const { revision: a } = published;
  // What a read of the backlog pinned at `revision` asked the GitHub behind
  // `server`.
  const backlogAsked = async (server: DashboardServer, revision: string) => {
    serveReusePublication(server.github, published);
    const response = await readAt(server, {
      source: origin.paths.sourceId,
      query: `&revision=${revision}`,
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      revision,
      backlog: files[origin.paths.backlog],
    });
    return server.github.calls.map(describedExactly);
  };

  const first = await startDashboardServer(developmentBoundary);
  try {
    expect(await backlogAsked(first, a)).toEqual([
      `content ${origin.paths.backlog}@${a}`,
    ]);
  } finally {
    await first.close();
  }
  const b = await advanceReusePublication(published, { files }, [
    madeBy("cf", [modified("src/app.ts")]),
  ]);
  const restarted = await startDashboardServer(developmentBoundary);
  try {
    expect(await backlogAsked(restarted, b)).toEqual([
      `content ${origin.paths.backlog}@${b}`,
    ]);
  } finally {
    await restarted.close();
  }
});
