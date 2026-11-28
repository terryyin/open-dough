// Failures and concurrency while comparing a revision the configured ref
// names next (../../server/pinnedTexts.ts): the backlog there never waits on the
// comparison, a failed comparison or commit read is not remembered and the
// read proceeds from GitHub, a rate limit is reported as one for the records
// alone, and a burst of reads shares one comparison and one read of each
// commit between (./revisionReuseBoundary.ts).

import { expect, test } from "../../test-support/support/pageTest.ts";
import { refusedMarker } from "../../test-support/support/sharedReads.ts";
import {
  noConnection,
  rateLimitedAnswer,
} from "../../test-support/originAnswers.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { answerFrom } from "../../test-support/revisionReuseAnswers.ts";
import {
  madeBy,
  modified,
  named,
  serveReusePublication,
} from "../../test-support/revisionReuseOrigin.ts";
import { revisionReuseBoundary, type Answer } from "./revisionReuseBoundary.ts";

const origin = makeMe.aProjectRevision;

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse failures at a newly named revision (development environment)", () => {
  const { server, at, asked, publishedAt, movedTo } = revisionReuseBoundary();

  test("a comparison that fails is not remembered: that read is answered from GitHub, and a later read compares again and reuses", async () => {
    const files = origin.labeled("failing").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const b = await movedTo(published, a, { files }, [
      madeBy("ca", [modified("src/app.ts")]),
    ]);
    const succeeding = published.compared.get(`${a}...${b}`);
    published.compared.set(`${a}...${b}`, () => noConnection);

    expect(
      await asked(async () => {
        expect(await at(b).backlog()).toEqual({
          status: 200,
          body: { revision: b, backlog: files[origin.paths.backlog] },
        });
      }),
    ).toEqual([]);
    let seed: Answer | undefined;
    expect(
      await asked(async () => {
        seed = await at(b).file(origin.paths.seed);
      }),
    ).toEqual([`compare ${a}...${b}`, `content ${origin.paths.seed}@${b}`]);
    expect(seed).toEqual({
      status: 200,
      body: {
        revision: b,
        path: origin.paths.seed,
        text: files[origin.paths.seed],
      },
    });

    if (succeeding !== undefined) {
      published.compared.set(`${a}...${b}`, succeeding);
    }
    expect(await asked(() => at(b).file(origin.paths.plan))).toEqual([
      `compare ${a}...${b}`,
      `commit ${named("ca")}`,
    ]);
  });

  test("a commit between that fails to be read is not remembered: that read is answered from GitHub, and a later read asks the commit again and reuses", async () => {
    const files = origin.labeled("failing commit").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const between = madeBy("cc", [modified("src/app.ts")]);
    const b = await movedTo(published, a, { files }, [between]);
    published.made.delete(between.sha);

    expect(
      await asked(async () => {
        expect(await at(b).backlog()).toEqual({
          status: 200,
          body: { revision: b, backlog: files[origin.paths.backlog] },
        });
      }),
    ).toEqual([]);
    let seed: Answer | undefined;
    expect(
      await asked(async () => {
        seed = await at(b).file(origin.paths.seed);
      }),
    ).toEqual([
      `compare ${a}...${b}`,
      `commit ${named("cc")}`,
      `content ${origin.paths.seed}@${b}`,
    ]);
    expect(seed).toEqual({
      status: 200,
      body: {
        revision: b,
        path: origin.paths.seed,
        text: files[origin.paths.seed],
      },
    });

    published.made.set(between.sha, between);
    expect(await asked(() => at(b).file(origin.paths.plan))).toEqual([
      `compare ${a}...${b}`,
      `commit ${named("cc")}`,
    ]);
  });

  test("the backlog at B is answered while the comparison is held, and a burst of reads there shares one comparison and one read of the commit between", async () => {
    const files = origin.labeled("burst").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const b = await movedTo(published, a, { files }, [
      madeBy("ce", [modified("src/app.ts")]),
    ]);
    // The comparison is answered once the first read has asked for it, while
    // the others are under way.
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    serveReusePublication(server().github, published, async (call) => {
      if (call.request.kind === "compare") await released;
      return answerFrom(published, call);
    });

    const reads = at(b);
    const calls = await asked(async () => {
      const held = reads.file(origin.paths.otherSeed);
      await expect
        .poll(() =>
          server().github.calls.some(
            ({ request }) =>
              request.kind === "compare" &&
              request.base === a &&
              request.head === b,
          ),
        )
        .toBe(true);
      // The verified Git membership at B answers while the comparison is held.
      expect(await reads.backlog()).toEqual({
        status: 200,
        body: { revision: b, backlog: files[origin.paths.backlog] },
      });
      const answers = Promise.all([
        held,
        reads.file(origin.paths.seed),
        reads.file(origin.paths.plan),
        reads.profiles(),
        reads.done(),
      ]);
      await refusedMarker(server());
      release();
      for (const answer of await answers) expect(answer.status).toBe(200);
    });
    expect(calls).toEqual([`compare ${a}...${b}`, `commit ${named("ce")}`]);
  });
});

// A rate limit holds back every later read of its server's process
// (github-request-admission.mjs), so the case that meets one has a server of its
// own.
test.describe("authenticated read reuse at a newly named revision under a rate limit (development environment)", () => {
  const { at, asked, publishedAt, movedTo } = revisionReuseBoundary();

  test("a comparison GitHub refuses with Retry-After leaves the backlog answered, and is reported as a rate limit for a record, reading nothing for it", async () => {
    const files = origin.labeled("limited").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const b = await movedTo(published, a, { files });
    published.compared.set(`${a}...${b}`, () =>
      rateLimitedAnswer(403, { "Retry-After": "120" }),
    );

    expect(await at(b).backlog()).toEqual({
      status: 200,
      body: { revision: b, backlog: files[origin.paths.backlog] },
    });
    let limited: Answer | undefined;
    expect(
      await asked(async () => {
        limited = await at(b).file(origin.paths.seed);
      }),
    ).toEqual([`compare ${a}...${b}`]);
    expect(limited).toMatchObject({
      status: 502,
      body: { retryAfterSeconds: 120 },
    });
    expect(JSON.stringify(limited?.body)).toContain("GitHub limited the rate");
  });
});
