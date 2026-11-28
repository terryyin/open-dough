// The real branch fetch can race an origin update after its advertisement.
// Only a verified fetch may replace the Board's durable branch record.
import { readFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { boardConfirmation } from "../../server/boardConfirmation.ts";
import { publishBranch } from "../../test-support/committedOriginRepo.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { homeReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import { everyRepository } from "../../test-support/support/fakeGitHub.ts";
import { rateLimitedAnswer } from "../../test-support/originAnswers.ts";
import {
  readAt,
  sharedReadsFacts,
  sharedReadsPublished,
  sharedSeedRead,
} from "../../test-support/support/sharedReads.ts";
import {
  heldUploadPack,
  readUntilClosed,
  signalFifo,
} from "../review/verifiedOriginTrunkCase.ts";
import {
  openStream,
  streamServer,
  streamUrl,
  withStreamOrigin,
} from "./revisionStreamBoundary.ts";

test("a watched branch advancing between advertisement and fetch leaves the former branch and time confirmed", async () => {
  const server = await streamServer();
  const repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("trunk", sharedReadsFacts())
      .withRevision("first", { files: { "first.txt": "First" } })
      .withRevision("racing", { files: { "racing.txt": "Racing" } })
      .withRevision("later", { files: { "later.txt": "Later" } })
      .please(),
  );
  const { trunk, first, racing, later } = repository.revisions;
  const branch = "story/one";
  publishBranch(repository.origin, "main", trunk);
  publishBranch(repository.origin, branch, first);
  const review = homeReviewRepository(server.home);
  const pack = heldUploadPack(repository.fixture, review, repository.origin, {
    heldFrom: 5,
  });
  const operations = () =>
    readFileSync(pack.log, "utf8")
      .split("\n")
      .filter((line) => line === "call").length;
  const check = () =>
    rawRequest({
      url: streamUrl(server, `&since=${trunk}&fresh=1`),
      headers: { Origin: server.origin },
    });

  try {
    expect((await check()).status).toBe(200);
    const former = await boardConfirmation(review, "main");
    expect(former).toMatchObject({
      revision: trunk,
      confirmedAt: expect.any(String),
      branches: expect.arrayContaining([{ branch, head: first }]),
    });
    expect(operations()).toBe(4); // Trunk probe/fetch and new branches probe/fetch.

    publishBranch(repository.origin, branch, racing);
    const held = readUntilClosed(pack.heldFifo);
    const pending = check();
    await expect(held).resolves.toBe("held\n");
    expect(await boardConfirmation(review, "main")).toEqual(former);
    publishBranch(repository.origin, branch, later);
    await signalFifo(pack.releaseFifo, true);

    expect((await pending).status).toBe(502);
    expect(await boardConfirmation(review, "main")).toEqual(former);
    expect(operations()).toBe(6); // One advertisement for trunk and known branches, then fetch.

    expect((await check()).status).toBe(200);
    const confirmed = await boardConfirmation(review, "main");
    expect(confirmed).toMatchObject({
      revision: trunk,
      branches: expect.arrayContaining([{ branch, head: later }]),
    });
    expect(String(confirmed?.confirmedAt) > String(former?.confirmedAt)).toBe(
      true,
    );
    expect(operations()).toBe(8);
    expect(server.github.calls).toEqual([]);
  } finally {
    await signalFifo(pack.releaseFifo, false);
    await server.close();
    await repository.cleanup();
  }
});

test("a watched stream reports a standing core wait without a REST branch listing", async () => {
  await withStreamOrigin(
    await streamServer(),
    async (origin, server) => {
      const { older, published } = origin.repository.revisions;
      const rest = sharedReadsPublished(older);
      server.github.serve(everyRepository, rest);
      expect((await readAt(server, `&revision=${older}`)).status).toBe(200);
      expect(
        (await readAt(server, `&revision=${older}&agents=profiles`)).status,
      ).toBe(200);
      server.github.serve(everyRepository, (call) =>
        call.request.kind === "content"
          ? Promise.resolve(rateLimitedAnswer(429, { "Retry-After": "120" }))
          : rest(call),
      );
      expect((await readAt(server, sharedSeedRead(older))).status).toBe(502);
      const before = server.github.calls.length;
      const watched = openStream(server, `&at=${older}&watch=story%2Fone`);
      const plain = openStream(server, `&at=${older}`);
      try {
        expect(await watched.nextEvent()).toMatchObject({
          retryAfterSeconds: expect.any(Number),
          error: expect.stringMatching(/limited the rate/i),
        });
        expect(await plain.nextEvent()).toMatchObject({
          revision: published,
          changed: true,
          confirmedAt: expect.any(String),
        });
        expect(server.github.calls.slice(before)).toEqual([]);
      } finally {
        watched.close();
        plain.close();
      }
    },
    sharedReadsFacts(),
  );
});
