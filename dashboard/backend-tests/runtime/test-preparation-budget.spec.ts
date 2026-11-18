import { observeQueuedOrigins } from "../support/queuedOriginsProof.ts";
import { expect, test as base } from "../../test-support/support/pageTest.ts";
import { coldInputPreparation } from "../../test-support/support/publishedMainWorkerFixtures.ts";

const test = base.extend<
  object,
  { queuedOrigins: Awaited<ReturnType<typeof observeQueuedOrigins>> }
>({
  queuedOrigins: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => use(await observeQueuedOrigins()),
    coldInputPreparation,
  ],
});

test("both queued origins are prepared before the first private copy", async ({
  queuedOrigins: { heldLayouts, casesWhileHeld, timing },
}) => {
  const { releasedAt, completed, firstCopyStartedAt } = timing;
  expect(heldLayouts).toEqual(["claude", "codex"]);
  expect(casesWhileHeld).toEqual([]);
  expect(completed.claude).toBeGreaterThanOrEqual(releasedAt);
  expect(completed.codex).toBeGreaterThanOrEqual(releasedAt);
  expect(firstCopyStartedAt).toBeGreaterThanOrEqual(
    Math.max(completed.claude ?? Infinity, completed.codex ?? Infinity),
  );
  await test.info().attach("preparation-and-case-intervals", {
    body: JSON.stringify(timing),
    contentType: "application/json",
  });
});

test("each host's copy contains its own installation", ({ queuedOrigins }) => {
  const [claude, codex, override] = queuedOrigins.cases;
  expect(claude).toMatchObject({
    host: "claude",
    tree: expect.arrayContaining([".claude"]),
  });
  expect(codex).toMatchObject({
    host: "codex",
    tree: expect.arrayContaining([".agents"]),
  });
  expect(claude?.tree).not.toEqual(codex?.tree);
  expect(override?.tree).toEqual(claude?.tree);
});

test("each case starts with a private copy", ({ queuedOrigins: { cases } }) => {
  const [claude, codex, override] = cases;
  expect(new Set(cases.map(({ origin }) => origin)).size).toBe(3);
  expect(claude?.branches).not.toContain("private-proof");
  expect(codex?.branches).not.toContain("private-proof");
  expect(override?.branches).not.toContain("private-proof");
});

test("a later revision becomes main in its own copy", ({ queuedOrigins }) => {
  const [claude, , override] = queuedOrigins.cases;
  expect(override?.host).toBe("claude");
  expect(override?.revisions).toEqual([
    ...(claude?.revisions ?? []),
    "changed review",
  ]);
  expect(override?.mainIsLast).toBe(true);
});
