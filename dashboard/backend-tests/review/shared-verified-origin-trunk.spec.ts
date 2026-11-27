import { readFileSync } from "node:fs";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { SharedVerifiedOriginTrunk } from "../../server/sharedVerifiedOriginTrunk.ts";
import {
  bareReview,
  freshPin,
  git,
  heldUploadPack,
  observedTrunk,
  opened,
  published,
  readUntilClosed,
  releaseWhenFinished,
  signalFifo,
} from "./verifiedOriginTrunkCase.ts";

const sharedChecks = () => new SharedVerifiedOriginTrunk({ reuseMs: () => 0 });

test("two opens of one project share one fetch and the same verified backlog", async () => {
  const backlog = "Published membership.\n";
  const { repository, source, pinned } = await opened(published(backlog));
  const { heldFifo, releaseFifo, log } = heldUploadPack(
    repository.fixture,
    reviewRepositoryPath(source),
    repository.origin,
  );
  const held = readUntilClosed(heldFifo);
  const checks = sharedChecks();
  const first = checks.demand(source, pinned, new AbortController().signal);
  const second = checks.demand(
    source,
    freshPin(),
    new AbortController().signal,
  );
  releaseWhenFinished(releaseFifo, [first, second]);
  await expect(held).resolves.toBe("held\n");
  await signalFifo(releaseFifo, true);
  const verified = observedTrunk(repository.trunkSha, backlog);
  await expect(first).resolves.toEqual(verified);
  await expect(second).resolves.toEqual(verified);
  expect(readFileSync(log, "utf8")).toBe("call\ncall\nheld\n");
});

test("aborting one waiter leaves the other to observe the verified trunk", async () => {
  const backlog = "Published membership.\n";
  const { repository, source, pinned } = await opened(published(backlog));
  const { heldFifo, releaseFifo } = heldUploadPack(
    repository.fixture,
    reviewRepositoryPath(source),
    repository.origin,
  );
  const held = readUntilClosed(heldFifo);
  const leaving = new AbortController();
  const checks = sharedChecks();
  const left = checks.demand(source, pinned, leaving.signal);
  const stayed = checks.demand(
    source,
    freshPin(),
    new AbortController().signal,
  );
  releaseWhenFinished(releaseFifo, [left, stayed]);
  await expect(held).resolves.toBe("held\n");
  leaving.abort();
  await expect(left).resolves.toEqual({ kind: "departed" });
  await signalFifo(releaseFifo, true);
  await expect(stayed).resolves.toEqual(
    observedTrunk(repository.trunkSha, backlog),
  );
});

test("a second project is verified while the first transfer stays held", async () => {
  const firstBacklog = "Open Dough backlog.\n";
  const secondBacklog = "Pygardon backlog.\n";
  const { repository, source, pinned } = await opened(published(firstBacklog));
  const secondSource = makeMe.aPublishedSource.pygardon.please();
  const secondRepository = await materializeRepository(
    published(secondBacklog),
  );
  onTestFinished(() => secondRepository.cleanup());
  bareReview(reviewRepositoryPath(secondSource), secondRepository.origin);
  const { heldFifo, releaseFifo } = heldUploadPack(
    repository.fixture,
    reviewRepositoryPath(source),
    repository.origin,
  );
  const held = readUntilClosed(heldFifo);
  const checks = sharedChecks();
  const blocked = checks.demand(source, pinned, new AbortController().signal);
  const free = checks.demand(
    secondSource,
    freshPin(),
    new AbortController().signal,
  );
  releaseWhenFinished(releaseFifo, [blocked, free]);
  await expect(held).resolves.toBe("held\n");
  await expect(free).resolves.toEqual(
    observedTrunk(secondRepository.trunkSha, secondBacklog),
  );
  await signalFifo(releaseFifo, true);
  await expect(blocked).resolves.toEqual(
    observedTrunk(repository.trunkSha, firstBacklog),
  );
});

test("a joined open past a short bound is unanswered and the opener still observes the pin", async () => {
  const backlog = "Published membership.\n";
  const { repository, source, pinned, signal } = await opened(
    published(backlog),
  );
  const { heldFifo, releaseFifo } = heldUploadPack(
    repository.fixture,
    reviewRepositoryPath(source),
    repository.origin,
  );
  const held = readUntilClosed(heldFifo);
  const checks = sharedChecks();
  const opener = checks.demand(source, pinned, new AbortController().signal);
  releaseWhenFinished(releaseFifo, [opener]);
  await expect(held).resolves.toBe("held\n");
  await expect(
    checks.demand(source, freshPin(), new AbortController().signal, {
      waitMs: 50,
    }),
  ).resolves.toEqual({ kind: "unanswered" });
  await signalFifo(releaseFifo, true);
  await expect(opener).resolves.toEqual(
    observedTrunk(repository.trunkSha, backlog),
  );
  await expect(
    pinned.reader(source, repository.trunkSha, signal)(source.backlogPath),
  ).resolves.toBe(backlog);
});

test("within production reuse a fresh demand starts a new check while a staggered tab shares the settled one", async () => {
  const backlog = "Published membership.\n";
  const { repository, source, pinned } = await opened(published(backlog));
  bareReview(reviewRepositoryPath(source), repository.origin);
  const checks = new SharedVerifiedOriginTrunk();
  await expect(
    checks.demand(source, pinned, new AbortController().signal),
  ).resolves.toEqual(observedTrunk(repository.trunkSha, backlog));
  git(
    repository.integration,
    "commit",
    "--allow-empty",
    "--quiet",
    "-m",
    "Moved",
  );
  git(
    repository.integration,
    "push",
    "--quiet",
    "origin",
    `HEAD:${source.ref}`,
  );
  const moved = git(repository.integration, "rev-parse", "HEAD");
  await expect(
    checks.demand(source, freshPin(), new AbortController().signal),
  ).resolves.toEqual(observedTrunk(repository.trunkSha, backlog));
  await expect(
    checks.demand(source, freshPin(), new AbortController().signal, {
      fresh: true,
    }),
  ).resolves.toEqual(observedTrunk(moved, backlog));
});
