// Failures and concurrency while comparing a revision the configured ref
// names next (../server/pinnedTexts.ts): the backlog there never waits on the
// comparison, a failed comparison or commit read is not remembered and the
// read proceeds from GitHub, a rate limit is reported as one for the records
// alone, and a burst of reads shares one comparison and one read of each
// commit between (./revisionReuseBoundary.ts).

import { expect, test } from "./support/pageTest.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import { noConnection, rateLimitedAnswer } from "./originAnswers.ts";
import {
  answerFrom,
  backlogPath,
  filesFor,
  madeBy,
  modified,
  named,
  otherSeedPath,
  planPath,
  seedPath,
} from "./revisionReuseOrigin.ts";
import { revisionReuseBoundary, type Answer } from "./revisionReuseBoundary.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse failures at a newly named revision (dev launch mode)", () => {
  const { server, at, asked, publishedAt, movedTo } = revisionReuseBoundary();

  test("a comparison that fails is not remembered: that read is answered from GitHub, and a later read compares again and reuses", async () => {
    const [a, b] = [named("aa"), named("ba")];
    const files = filesFor("failing");
    const published = await publishedAt(a, files);
    await movedTo(published, a, { revision: b, files }, [
      madeBy("ca", [modified("src/app.ts")]),
    ]);
    const succeeding = published.compared.get(`${a}...${b}`);
    published.compared.set(`${a}...${b}`, () => noConnection);

    expect(await asked(() => at(b).backlog())).toEqual([
      `content ${backlogPath}@ba`,
    ]);
    let seed: Answer | undefined;
    expect(
      await asked(async () => {
        seed = await at(b).file(seedPath);
      }),
    ).toEqual(["compare aa...ba", `content ${seedPath}@ba`]);
    expect(seed).toEqual({
      status: 200,
      body: { revision: b, path: seedPath, text: files[seedPath] },
    });

    if (succeeding !== undefined) {
      published.compared.set(`${a}...${b}`, succeeding);
    }
    expect(await asked(() => at(b).file(planPath))).toEqual([
      "compare aa...ba",
      "commit ca",
    ]);
  });

  test("a commit between that fails to be read is not remembered: that read is answered from GitHub, and a later read asks the commit again and reuses", async () => {
    const [a, b] = [named("ac"), named("bc")];
    const files = filesFor("failing commit");
    const published = await publishedAt(a, files);
    const between = madeBy("cc", [modified("src/app.ts")]);
    await movedTo(published, a, { revision: b, files }, [between]);
    published.made.delete(between.sha);

    expect(await asked(() => at(b).backlog())).toEqual([
      `content ${backlogPath}@bc`,
    ]);
    let seed: Answer | undefined;
    expect(
      await asked(async () => {
        seed = await at(b).file(seedPath);
      }),
    ).toEqual(["compare ac...bc", "commit cc", `content ${seedPath}@bc`]);
    expect(seed).toEqual({
      status: 200,
      body: { revision: b, path: seedPath, text: files[seedPath] },
    });

    published.made.set(between.sha, between);
    expect(await asked(() => at(b).file(planPath))).toEqual([
      "compare ac...bc",
      "commit cc",
    ]);
  });

  test("the backlog at B is answered while the comparison is held, and a burst of reads there shares one comparison and one read of the commit between", async () => {
    const [a, b] = [named("ae"), named("be")];
    const files = filesFor("burst");
    const published = await publishedAt(a, files);
    await movedTo(published, a, { revision: b, files }, [
      madeBy("ce", [modified("src/app.ts")]),
    ]);
    // The comparison is answered once the first read has asked for it, while
    // the others are under way.
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    server().github.serve(everyRepository, async (call) => {
      if (call.request.kind === "compare") await released;
      return answerFrom(published, call);
    });

    const reads = at(b);
    const calls = await asked(async () => {
      const held = reads.file(otherSeedPath);
      await expect
        .poll(() =>
          server().github.calls.some(
            ({ request }) => request.kind === "compare",
          ),
        )
        .toBe(true);
      // Membership at B asks nothing more of GitHub while the comparison is
      // held: the backlog the held read made reachable is B's own.
      expect(await reads.backlog()).toEqual({
        status: 200,
        body: { revision: b, backlog: files[backlogPath] },
      });
      const answers = Promise.all([
        held,
        reads.file(seedPath),
        reads.file(planPath),
        reads.profiles(),
        reads.done(),
      ]);
      release();
      for (const answer of await answers) expect(answer.status).toBe(200);
    });
    expect(calls).toEqual([
      `content ${backlogPath}@be`,
      "compare ae...be",
      "commit ce",
    ]);
  });
});

// A rate limit holds back every later read of its server's process
// (../server/readAdmission.ts), so the case that meets one has a server of its
// own.
test.describe("authenticated read reuse at a newly named revision under a rate limit (dev launch mode)", () => {
  const { at, asked, publishedAt, movedTo } = revisionReuseBoundary();

  test("a comparison GitHub refuses with Retry-After leaves the backlog answered, and is reported as a rate limit for a record, reading nothing for it", async () => {
    const [a, b] = [named("ab"), named("bb")];
    const files = filesFor("limited");
    const published = await publishedAt(a, files);
    await movedTo(published, a, { revision: b, files });
    published.compared.set(`${a}...${b}`, () =>
      rateLimitedAnswer(403, { "Retry-After": "120" }),
    );

    expect(await at(b).backlog()).toEqual({
      status: 200,
      body: { revision: b, backlog: files[backlogPath] },
    });
    let limited: Answer | undefined;
    expect(
      await asked(async () => {
        limited = await at(b).file(seedPath);
      }),
    ).toEqual(["compare ab...bb"]);
    expect(limited).toMatchObject({
      status: 502,
      body: { retryAfterSeconds: 120 },
    });
    expect(JSON.stringify(limited?.body)).toContain("GitHub limited the rate");
  });
});
