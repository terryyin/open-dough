// A standalone session's published close record of several ordered ranges:
// each range is reviewed and read on its own recorded pair, and a range the
// publisher marked shared-checkout carries the shared Done warning while its
// unmarked sibling does not.
import { expect, test } from "vitest";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-revision-commit.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import {
  publishedAt,
  read,
  readFile,
  recordPublished,
} from "../support/publishedSessionCase.ts";

// A checkout whose trunk published a session's two disjoint pairs, another
// writer's revision between them, and the session's close record; the second
// pair marked shared-checkout when `secondSharesCheckout`.
async function aTwoRangeSession({ secondSharesCheckout = false } = {}) {
  const { checkout } = await aDoneCaptureCase().please();
  const repository = checkout.integration;
  const added = (file: string) =>
    commitDeclaredRevision(repository, { files: { [file]: `${file}\n` } });
  const first = { base: checkout.base, candidate: await added("notes.md") };
  const between = await added("other.md");
  const second = { base: between, candidate: await added("second.md") };
  const closing = makeMe.aSessionRecord.closing(first).andClosing(second);
  const record = (
    secondSharesCheckout ? closing.sharingCheckout() : closing
  ).please();
  const revision = await recordPublished(repository, record);
  return {
    ...publishedAt(repository, revision, record.sessionId, first),
    second,
  };
}

test("Given a published session of two ranges, when each range is selected, then only that recorded pair's files are shown", async () => {
  const session = await aTwoRangeSession();

  await expect(read(session)).resolves.toMatchObject({
    kind: "published-session",
    ranges: 2,
    selectedRun: "0",
    baseline: session.base,
    tree: session.candidate,
    files: [expect.objectContaining({ path: "notes.md" })],
  });
  const second = await read(session, { run: "1" });
  expect(second).toMatchObject({
    selectedRun: "1",
    baseline: session.second.base,
    tree: session.second.candidate,
  });
  expect(second).toHaveProperty("files", [
    expect.objectContaining({ path: "second.md" }),
  ]);
});

test("Given a published session of two ranges, when a range it did not record is selected, then it is refused", async () => {
  const session = await aTwoRangeSession();

  await expect(read(session, { run: "2" })).rejects.toMatchObject({
    status: 409,
  });
});

test("Given a published session of two ranges, when a file of its second pair is read, then its diff is shown", async () => {
  const session = await aTwoRangeSession();

  const diff = readFile(session, {
    baseline: session.second.base,
    tree: session.second.candidate,
    path: "second.md",
  });

  await expect(diff).resolves.toMatchObject({
    printed: expect.stringContaining("+second.md") as unknown,
  });
});

test("Given a published session of two ranges, when a file across its pairs is read, then it is refused", async () => {
  const session = await aTwoRangeSession();

  const across = readFile(session, {
    tree: session.second.candidate,
    path: "other.md",
  });

  await expect(across).rejects.toMatchObject({ status: 409 });
});

test("Given a published session whose second range shares its checkout, when that range is selected, then the review notes the shared checkout", async () => {
  const session = await aTwoRangeSession({ secondSharesCheckout: true });

  const review = await read(session, { run: "1" });

  expect(review).toMatchObject({
    kind: "published-session",
    selectedRun: "1",
    session: { shared: true },
  });
});

test("Given a published session whose second range shares its checkout, when its unmarked first range is selected, then the review notes no shared checkout", async () => {
  const session = await aTwoRangeSession({ secondSharesCheckout: true });

  const review = await read(session, { run: "0" });

  expect(review).toMatchObject({ selectedRun: "0" });
  expect(review).not.toHaveProperty("session.shared");
});
