// A departed reader's file diff or text stops admission Git; an expired
// admission deadline with an active caller keeps today's refusal.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";

const signal = () => new AbortController().signal;
const kept = [...Array(12).keys()].map((line) => `kept ${line}\n`).join("");
const renamedFile = { path: "new.txt", oldPath: "old.txt" };
const reference = "11111111-1111-4111-8111-111111111111";

async function renameRevisionRepo() {
  return materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", { backlog: null, files: { "old.txt": kept } })
      .withRevision("result", {
        backlog: null,
        remove: ["old.txt"],
        files: { "new.txt": `${kept}renamed\n` },
      })
      .please(),
  );
}

async function withImmediateAdmissionDeadline<T>(
  observe: (waits: number[]) => Promise<T>,
): Promise<T> {
  const timeout = Object.getOwnPropertyDescriptor(AbortSignal, "timeout");
  if (timeout === undefined) throw new Error("Missing abort deadline.");
  const waits: number[] = [];
  AbortSignal.timeout = (ms) => {
    waits.push(ms);
    return AbortSignal.abort(
      new DOMException("The operation was aborted.", "TimeoutError"),
    );
  };
  try {
    return await observe(waits);
  } finally {
    Object.defineProperty(AbortSignal, "timeout", timeout);
  }
}

// Diff and text share one admission, so one read per admission path proves it.
test("Given a session with one kept run, when a cancelled file text request reaches admission, then it rejects with the abort", async () => {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const read = makeMe.aSessionReviewRead
      .ofAdHocSessionWithKeptRun("session-abort-kept", {
        repository: repository.integration,
        run: { base, revision: result },
      })
      .readingFile({ baseline: base, tree: result, ...renamedFile })
      .please();
    await expect(
      reviewedFileText(read, AbortSignal.abort()),
    ).rejects.toMatchObject({ name: "AbortError" });
  } finally {
    await repository.cleanup();
  }
});

test("Given a kept landed session, when a cancelled file diff request reaches admission, then it rejects with the abort", async () => {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const read = makeMe.aSessionReviewRead
      .ofLandedAdHocSession("ad-hoc-file-abort-landed", {
        repository: repository.integration,
        comparing: { base, revision: result },
        reference,
      })
      .readingFile({ reference, baseline: base, tree: result, ...renamedFile })
      .please();
    await expect(
      reviewedFileDiff(read, AbortSignal.abort()),
    ).rejects.toMatchObject({ name: "AbortError" });
  } finally {
    await repository.cleanup();
  }
});

test("Given a session with one kept run, when admission's 30-second deadline expires while the caller stays, then file text keeps the kept-commits refusal", async () => {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const read = makeMe.aSessionReviewRead
      .ofAdHocSessionWithKeptRun("session-deadline-kept", {
        repository: repository.integration,
        run: { base, revision: result },
      })
      .readingFile({ baseline: base, tree: result, ...renamedFile })
      .please();
    await withImmediateAdmissionDeadline(async (waits) => {
      const refused = reviewedFileText(read, signal());
      await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
      await expect(refused).rejects.toMatchObject({
        status: 409,
        message:
          "The file or comparison does not belong to this session's kept commits.",
      });
      expect(waits).toEqual([30_000]);
    });
  } finally {
    await repository.cleanup();
  }
});

test("Given a kept landed session, when admission's 30-second deadline expires while the caller stays, then file diff keeps the missing-objects refusal", async () => {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const read = makeMe.aSessionReviewRead
      .ofLandedAdHocSession("ad-hoc-file-deadline-landed", {
        repository: repository.integration,
        comparing: { base, revision: result },
        reference,
      })
      .readingFile({ reference, baseline: base, tree: result, ...renamedFile })
      .please();
    await withImmediateAdmissionDeadline(async (waits) => {
      const refused = reviewedFileDiff(read, signal());
      await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
      await expect(refused).rejects.toMatchObject({
        status: 409,
        message:
          "The captured landing comparison objects are missing or unreadable.",
      });
      expect(waits).toEqual([30_000]);
    });
  } finally {
    await repository.cleanup();
  }
});
