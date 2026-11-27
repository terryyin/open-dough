import { execFileSync } from "node:child_process";
import { constants, mkdirSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";
import { expect, onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { verifiedOriginTrunk } from "../../server/verifiedOriginTrunk.ts";
import { stubFixtureHome } from "../support/fixtureHome.ts";

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";

export const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8" }).trim();

// The published backlog at origin's trunk.
export const published = (backlog: string) =>
  makeMe.aRepository
    .withRevision("published", { files: { [backlogPath]: backlog } })
    .please();

// Pinned texts of one open, shared with no other.
export const freshPin = () =>
  new PinnedTexts(new RevisionMemo(new RetainedAnswers()));

// A shared check's answer: origin verified `revision` with `backlog`.
export const observedTrunk = (revision: string, backlog: string) => ({
  kind: "observed",
  value: {
    askedAt: expect.any(String) as unknown,
    trunk: {
      kind: "verified",
      revision,
      backlog,
      confirmedAt: expect.any(String) as unknown,
    },
  },
});

// Lets a held upload-pack through once the case ends and waits for `pending`.
export function releaseWhenFinished(
  releaseFifo: string,
  pending: readonly Promise<unknown>[],
) {
  onTestFinished(async () => {
    await signalFifo(releaseFifo, false);
    await Promise.all(pending.map((demand) => demand.catch(() => undefined)));
  });
}

export async function opened(
  description: Parameters<typeof materializeRepository>[0],
  source = makeMe.aPublishedSource.openDough.please(),
) {
  const repository = await materializeRepository(description);
  const home = path.join(repository.fixture, "home");
  mkdirSync(home);
  stubFixtureHome(home, repository.origin);
  const pinned = freshPin();
  const signal = new AbortController().signal;
  onTestFinished(async () => {
    vi.unstubAllEnvs();
    await repository.cleanup();
  });
  return {
    repository,
    source,
    pinned,
    signal,
    read: () => verifiedOriginTrunk(source, pinned, signal),
  };
}

// The fifo gate stays beside these cases. `dashboard/test-support/` holds
// MakeMe builders and page objects only, so the gate is not lifted there.
// `ls-remote` and fetch both run it when the remote name is `origin`.
// Holds each upload-pack after the first (the probe), or from the first with
// `heldFrom: 0`, until released.
export function heldUploadPack(
  fixture: string,
  reviewDirectory: string,
  origin: string,
  { heldFrom = 1 } = {},
) {
  const log = path.join(fixture, "upload-pack.log");
  const heldFifo = path.join(fixture, "held-upload-pack");
  const releaseFifo = path.join(fixture, "release-upload-pack");
  const released = path.join(fixture, "upload-pack-released");
  const gate = path.join(fixture, "hold-upload-pack");
  writeFileSync(log, "");
  execFileSync("mkfifo", [heldFifo, releaseFifo]);
  writeFileSync(
    gate,
    `#!/bin/sh
n=$(wc -l < "${log}" | tr -d ' ')
printf 'call\\n' >> "${log}"
if [ "$n" -ge ${heldFrom} ] && [ ! -f "${released}" ]; then
  printf 'held\\n' >> "${log}"
  printf 'held\\n' > "${heldFifo}"
  read -r _ < "${releaseFifo}"
  : > "${released}"
fi
exec git upload-pack "$@"
`,
    { mode: 0o755 },
  );
  bareReview(reviewDirectory, origin, gate);
  return { log, heldFifo, releaseFifo, gate };
}

export function bareReview(
  directory: string,
  origin: string,
  uploadpack?: string,
) {
  mkdirSync(directory, { recursive: true });
  git(directory, "init", "--bare", "--quiet");
  git(directory, "remote", "add", "origin", origin);
  if (uploadpack !== undefined)
    git(directory, "config", "remote.origin.uploadpack", uploadpack);
}

export async function readUntilClosed(fifo: string) {
  const handle = await open(fifo, "r");
  try {
    const read = await handle.read(Buffer.alloc(64), 0, 64, null);
    return read.buffer.subarray(0, read.bytesRead).toString("utf8");
  } finally {
    await handle.close();
  }
}

export async function signalFifo(fifo: string, blocking: boolean) {
  const flags = blocking ? "w" : constants.O_WRONLY | constants.O_NONBLOCK;
  let handle;
  try {
    handle = await open(fifo, flags);
  } catch (error) {
    if (
      !blocking &&
      error instanceof Error &&
      "code" in error &&
      error.code === "ENXIO"
    )
      return;
    throw error;
  }
  try {
    await handle.write(Buffer.from("\n"));
  } finally {
    await handle.close();
  }
}
