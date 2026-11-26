import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { GhFailure } from "../../server/ghFailure.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { fixtureRepository } from "../support/fixtureHome.ts";
import {
  backlogPath,
  bareReview,
  git,
  heldUploadPack,
  opened,
  readUntilClosed,
  signalFifo,
} from "./verifiedOriginTrunkCase.ts";

test("an initial publication pins the published commit and its backlog bytes", async () => {
  const published = "Published membership.\n";
  const { repository, read } = await opened(
    makeMe.aRepository
      .withRevision("published", { files: { [backlogPath]: published } })
      .please(),
  );
  await expect(read()).resolves.toEqual({
    kind: "verified",
    revision: repository.trunkSha,
    backlog: published,
  });
});

test("a changed publication answers the new probed commit's backlog", async () => {
  const first = "First published backlog.\n";
  const next = "Changed published backlog.\n";
  const { repository, read } = await opened(
    makeMe.aRepository
      .withRevision("published", { files: { [backlogPath]: first } })
      .please(),
  );
  await expect(read()).resolves.toEqual({
    kind: "verified",
    revision: repository.trunkSha,
    backlog: first,
  });
  const moved = await commitDeclaredRevision(repository.integration, {
    files: { [backlogPath]: next },
  });
  git(
    repository.integration,
    "push",
    "--quiet",
    "origin",
    "HEAD:refs/heads/main",
  );
  await expect(read()).resolves.toEqual({
    kind: "verified",
    revision: moved,
    backlog: next,
  });
});

test("a transfer held while the ref moves from A to B is rejected, and a retry serves B", async () => {
  const atA = "Backlog at A.\n";
  const atB = "Backlog at B.\n";
  const { repository, source, read } = await opened(
    makeMe.aRepository
      .withRevision("a", { files: { [backlogPath]: atA } })
      .withRevision("b", { files: { [backlogPath]: atB } })
      .please(),
  );
  const publishedA = repository.revisions.a;
  if (publishedA === undefined)
    throw new Error("Revision a was not materialized.");
  git(repository.origin, "update-ref", "refs/heads/main", publishedA);
  const { heldFifo, releaseFifo } = heldUploadPack(
    repository.fixture,
    reviewRepositoryPath(source),
    repository.origin,
  );
  const held = readUntilClosed(heldFifo);
  const first = read();
  onTestFinished(async () => {
    await signalFifo(releaseFifo, false);
    await first.catch(() => undefined);
  });
  await expect(held).resolves.toBe("held\n");
  const publishedB = repository.revisions.b;
  if (publishedB === undefined)
    throw new Error("Revision b was not materialized.");
  git(repository.origin, "update-ref", "refs/heads/main", publishedB);
  await signalFifo(releaseFifo, true);
  await expect(first).resolves.toEqual({ kind: "rejected" });
  await expect(read()).resolves.toEqual({
    kind: "verified",
    revision: repository.revisions.b,
    backlog: atB,
  });
});

test("a missing ref is a missing trunk", async () => {
  const { read } = await opened(
    makeMe.aRepository
      .withRevision("published", {
        files: { [backlogPath]: "Present on main.\n" },
      })
      .please(),
    makeMe.aPublishedSource
      .with({
        id: "open-dough",
        label: "Open Dough",
        repository: fixtureRepository,
        ref: "absent",
      })
      .please(),
  );
  await expect(read()).resolves.toEqual({ kind: "missing-trunk" });
});

test("an unreadable backlog at the probed commit is not admitted", async () => {
  const { read } = await opened(
    makeMe.aRepository.withRevision("published", { backlog: null }).please(),
  );
  await expect(read()).resolves.toEqual({ kind: "unreadable-backlog" });
});

test("401 and 403 stderr are refusal, and another 128 is unavailable", async () => {
  const { repository, source, read } = await opened(
    makeMe.aRepository
      .withRevision("published", {
        files: { [backlogPath]: "Published membership.\n" },
      })
      .please(),
  );
  const said = path.join(repository.fixture, "remote-stderr");
  const gate = path.join(repository.fixture, "refusing-upload-pack");
  writeFileSync(gate, `#!/bin/sh\ncat "${said}" >&2\nexit 128\n`, {
    mode: 0o755,
  });
  bareReview(reviewRepositoryPath(source), repository.origin, gate);
  const trailer = "fatal: Could not read from remote repository.\n";
  const whenRemoteSays = async (stderr: string) => {
    writeFileSync(said, stderr);
    return read();
  };
  const expectRefusal = async (stderr: string, status: number) => {
    const pending = whenRemoteSays(stderr);
    await expect(pending).rejects.toBeInstanceOf(GhFailure);
    await expect(pending).rejects.toMatchObject({
      reason: { kind: "http", status },
    });
  };
  await expectRefusal(
    `fatal: could not read Username for 'https://github.com/${fixtureRepository}.git': terminal prompts disabled\n${trailer}`,
    401,
  );
  await expectRefusal(
    `error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403\n${trailer}`,
    403,
  );
  await expect(
    whenRemoteSays(`remote: Repository not found.\n${trailer}`),
  ).resolves.toEqual({ kind: "unavailable" });
  await expect(
    whenRemoteSays(
      `fatal: Authentication failed for 'https://github.com/${fixtureRepository}.git/'\n${trailer}`,
    ),
  ).resolves.toEqual({ kind: "unavailable" });
});
