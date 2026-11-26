import { execFileSync } from "node:child_process";
import { constants, mkdirSync } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";
import { onTestFinished, vi } from "vitest";
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

export async function opened(
  description: Parameters<typeof materializeRepository>[0],
  source = makeMe.aPublishedSource.openDough.please(),
) {
  const repository = await materializeRepository(description);
  const home = path.join(repository.fixture, "home");
  mkdirSync(home);
  stubFixtureHome(home, repository.origin);
  const pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
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

export function bareReview(
  directory: string,
  origin: string,
  uploadpack: string,
) {
  mkdirSync(directory, { recursive: true });
  git(directory, "init", "--bare", "--quiet");
  git(directory, "remote", "add", "origin", origin);
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
