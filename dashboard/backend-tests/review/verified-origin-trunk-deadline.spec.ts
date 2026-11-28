// A shared trunk check held past its read deadline: what it leaves running,
// and what the next open does.
import { execFileSync } from "node:child_process";
import { expect, test } from "vitest";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { SharedVerifiedOriginTrunk } from "../../server/sharedVerifiedOriginTrunk.ts";
import {
  freshPin,
  heldUploadPack,
  observedTrunk,
  opened,
  published,
  readUntilClosed,
  releaseWhenFinished,
  signalFifo,
} from "./verifiedOriginTrunkCase.ts";

// Processes whose command line names `script`, such as a held gate.
const processesRunning = (script: string) =>
  execFileSync("ps", ["-axo", "args="], { encoding: "utf8" })
    .split("\n")
    .filter((line) => line.includes(script));

test("a transfer held past the read deadline is ended and the next open starts a new check", async () => {
  const backlog = "Published membership.\n";
  const { repository, source, pinned } = await opened(published(backlog));
  const { heldFifo, releaseFifo } = heldUploadPack(
    repository.fixture,
    reviewRepositoryPath(source),
    repository.origin,
  );
  const held = readUntilClosed(heldFifo);
  const deadlines: AbortController[] = [];
  const checks = new SharedVerifiedOriginTrunk({
    reuseMs: () => 0,
    deadline: () => {
      const deadline = new AbortController();
      deadlines.push(deadline);
      return deadline.signal;
    },
  });
  const stalled = expect(
    checks.demand(source, pinned, new AbortController().signal),
  ).rejects.toMatchObject({ reason: { kind: "timed-out" } });
  await expect(held).resolves.toBe("held\n");
  deadlines[0]?.abort();
  await stalled;
  const heldAgain = readUntilClosed(heldFifo);
  const reopened = checks.demand(
    source,
    freshPin(),
    new AbortController().signal,
  );
  releaseWhenFinished(releaseFifo, [reopened]);
  await expect(heldAgain).resolves.toBe("held\n");
  await signalFifo(releaseFifo, true);
  await expect(reopened).resolves.toEqual(
    observedTrunk(repository.trunkSha, backlog),
  );
});

test("a probe held past the read deadline is ended with its transport", async () => {
  const { repository, source, pinned } = await opened(published("Held.\n"));
  const { heldFifo, releaseFifo, gate } = heldUploadPack(
    repository.fixture,
    reviewRepositoryPath(source),
    repository.origin,
    { heldFrom: 0 },
  );
  const held = readUntilClosed(heldFifo);
  const deadline = new AbortController();
  const checks = new SharedVerifiedOriginTrunk({
    reuseMs: () => 0,
    deadline: () => deadline.signal,
  });
  const stalled = checks.demand(source, pinned, new AbortController().signal);
  releaseWhenFinished(releaseFifo, [stalled]);
  await expect(held).resolves.toBe("held\n");
  deadline.abort();
  await expect(stalled).rejects.toMatchObject({
    reason: { kind: "timed-out" },
  });
  await expect.poll(() => processesRunning(gate)).toEqual([]);
});
