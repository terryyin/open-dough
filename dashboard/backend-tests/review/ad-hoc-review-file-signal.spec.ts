// Admission cancellation and its independent deadline at a published file.
import { expect, test } from "vitest";
import { reviewedFileText } from "../../server/storyReviewFileResponse.ts";
import {
  aPublishedSession,
  publishedIdentity,
} from "../support/publishedSessionCase.ts";

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

async function publishedFile() {
  const published = await aPublishedSession();
  return {
    read: {
      subject: {
        source: "open-dough",
        identity: publishedIdentity,
        published: published.sessionId,
      },
      baseline: published.base,
      tree: published.candidate,
      path: "notes.md",
    },
    published: published.source,
    now: new Date(),
  };
}

test("a cancelled published session file read rejects with the caller's abort", async () => {
  const file = await publishedFile();
  await expect(
    reviewedFileText(file, AbortSignal.abort()),
  ).rejects.toMatchObject({ name: "AbortError" });
});

test("an active reader receives the published pair refusal when admission expires", async () => {
  const file = await publishedFile();
  await withImmediateAdmissionDeadline(async (waits) => {
    await expect(
      reviewedFileText(file, new AbortController().signal),
    ).rejects.toMatchObject({ status: 409 });
    expect(waits).toEqual([30_000]);
  });
});
