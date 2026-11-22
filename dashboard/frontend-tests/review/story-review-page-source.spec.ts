// The story review's page source (../../src/reviewSource.ts): a refused read
// rejects with the endpoint's own words or The review was refused., and the
// reader's abort signal reaches the request.
import { afterEach, expect, test, vi } from "vitest";
import { pageReviewSource } from "../../src/reviewSource.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

test.each([
  {
    refusal: { error: "The story's worktree is gone." },
    words: "The story's worktree is gone.",
  },
  { refusal: {}, words: "The review was refused." },
])("a refused read rejects with $words", async ({ refusal, words }) => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json(refusal, { status: 409 }),
  );

  await expect(
    pageReviewSource.review({ story: "S" }, new AbortController().signal),
  ).rejects.toThrow(words);
});

test("leaving a read aborts its request", () => {
  const signals: (AbortSignal | null | undefined)[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation((...[, init]) => {
    signals.push(init?.signal);
    return new Promise(() => undefined);
  });
  const controller = new AbortController();

  void pageReviewSource.fileText({ path: "a.ts" }, controller.signal);
  controller.abort();

  expect(signals[0]?.aborted).toBe(true);
});
