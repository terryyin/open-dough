// Background retention of the measured attempt's validated proof. Collection
// runs with Intent closed; the retained document and a typed proof read name
// the same attempt.
import { expect, test } from "vitest";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { performIntentCiProofRead } from "../../server/intentCiProofRead.ts";
import {
  collectRetainedLandedCiProof,
  retainedProofScope,
  retainedProofSource,
} from "../support/retainedLandedCiProof.ts";

const source = retainedProofSource;
const scope = retainedProofScope;

for (const proofState of ["summary", "mismatched", "expired"] as const) {
  test(`retains ${proofState} proof for a recorded landed attempt while Intent is closed`, async () => {
    const {
      repository,
      stopped,
      revision,
      subject,
      key,
      summary,
      listing,
      archive,
      readers,
      kept,
    } = await collectRetainedLandedCiProof(proofState);

    expect(Object.keys(kept.builds)).toEqual([key]);
    expect(kept.builds[key]?.proof).toEqual(
      proofState === "summary"
        ? { kind: "summary", summary }
        : expect.objectContaining({
            kind: "unavailable",
            reason: proofState,
          }),
    );
    // Collection asked once; expired never downloads the zip.
    expect(listing).toHaveBeenCalledTimes(1);
    expect(archive).toHaveBeenCalledTimes(proofState === "expired" ? 0 : 1);

    expect(
      await performIntentCiProofRead(
        source,
        { kind: "intent-ci-proof", ...subject },
        stopped.signal,
        () => repository,
        readers,
      ),
    ).toMatchObject({
      kind: "answered",
      answer: {
        runId: subject.runId,
        runAttempt: subject.runAttempt,
        revision,
        proof:
          proofState === "summary"
            ? { kind: "summary", summary }
            : { kind: "unavailable", reason: proofState },
      },
    });
  });
}

test("retained summary answers scoped and wall-time history without further provider calls", async () => {
  const {
    repository,
    stopped,
    revision,
    receivedAt,
    subject,
    key,
    summary,
    github,
    listing,
    archive,
    readers,
  } = await collectRetainedLandedCiProof("summary");

  const listingBefore = listing.mock.calls.length;
  const archiveBefore = archive.mock.calls.length;
  expect(
    await performIntentCiProofRead(
      source,
      { kind: "intent-ci-proof", ...subject },
      stopped.signal,
      () => repository,
      readers,
    ),
  ).toMatchObject({
    kind: "answered",
    answer: { proof: { kind: "summary", summary } },
  });
  // Remembered summary answers without another listing or archive ask.
  expect(listing.mock.calls.length).toBe(listingBefore);
  expect(archive.mock.calls.length).toBe(archiveBefore);

  const githubBefore = github.mock.calls.length;
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope,
      revision,
      through: receivedAt,
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          kind: "point",
          key,
          selected: true,
          readings: [
            { kind: "point", unit: "case", ms: 1200 },
            { kind: "point", unit: "file", ms: 0 },
          ],
        },
      ],
    },
  });
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      entries: [{ kind: "point", revision }],
    },
  });
  expect(github.mock.calls.length).toBe(githubBefore);
});
