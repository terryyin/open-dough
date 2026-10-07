// Failures and concurrency while comparing a revision the configured ref
// names next (../server/pinnedTexts.ts): a failed comparison is not
// remembered and the read proceeds from GitHub, a rate limit is reported as
// one, and a burst of reads shares one comparison and one read of each commit
// between (./revisionReuseBoundary.ts).

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

    let backlog: Answer | undefined;
    expect(
      await asked(async () => {
        backlog = await at(b).backlog();
      }),
    ).toEqual(["compare aa...ba", `content ${backlogPath}@ba`]);
    expect(backlog).toEqual({
      status: 200,
      body: { revision: b, backlog: files[backlogPath] },
    });

    if (succeeding !== undefined) {
      published.compared.set(`${a}...${b}`, succeeding);
    }
    expect(await asked(() => at(b).file(seedPath))).toEqual([
      "compare aa...ba",
      "commit ca",
    ]);
  });

  test("a comparison GitHub refuses with Retry-After is reported as a rate limit, and nothing is read for it", async () => {
    const [a, b] = [named("ab"), named("bb")];
    const files = filesFor("limited");
    const published = await publishedAt(a, files);
    await movedTo(published, a, { revision: b, files });
    published.compared.set(`${a}...${b}`, () =>
      rateLimitedAnswer(403, { "Retry-After": "120" }),
    );

    let limited: Answer | undefined;
    expect(
      await asked(async () => {
        limited = await at(b).backlog();
      }),
    ).toEqual(["compare ab...bb"]);
    expect(limited).toMatchObject({
      status: 502,
      body: { retryAfterSeconds: 120 },
    });
    expect(JSON.stringify(limited?.body)).toContain("GitHub limited the rate");
  });

  test("a burst of reads at B shares one comparison and one read of the commit between", async () => {
    const [a, b] = [named("ae"), named("be")];
    const files = filesFor("burst");
    const published = await publishedAt(a, files);
    await movedTo(published, a, { revision: b, files }, [
      madeBy("ce", [modified("src/app.ts")]),
    ]);
    // GitHub answers the comparison only after every read has asked for it.
    const comparing = published.compared.get(`${a}...${b}`);
    published.compared.set(`${a}...${b}`, (perPage) =>
      comparing === undefined ? noConnection : comparing(perPage),
    );
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
      const answers = Promise.all([
        reads.backlog(),
        reads.file(seedPath),
        reads.file(planPath),
        reads.profiles(),
        reads.done(),
      ]);
      await expect
        .poll(() =>
          server().github.calls.some(
            ({ request }) => request.kind === "compare",
          ),
        )
        .toBe(true);
      // Every read reaches its comparison within moments of the first.
      await new Promise((resolve) => setTimeout(resolve, 300));
      release();
      for (const answer of await answers) expect(answer.status).toBe(200);
    });
    expect(calls).toEqual(["compare ae...be", "commit ce"]);
  });
});
