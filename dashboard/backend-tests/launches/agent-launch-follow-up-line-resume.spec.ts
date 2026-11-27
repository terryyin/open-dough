// Start matches a file follow-up of a Done story's Published completion to
// its kept attempts: different line anchors are separate attempts; the same
// anchor and text continue the kept start. First-input content:
// agent-launch-follow-up-file.spec.ts.
import { expect, test } from "vitest";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { renamedNewPath } from "../../test-support/support/followUpCompletedFile.ts";
import { renamedFileCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import { aDoneStoryStart, storyA } from "../support/doneStoryStart.ts";

test("follow-ups of two lines are two launches, and repeating one resumes its kept start", async () => {
  const { publishedFileAt, received, refuseNext, startAt } =
    await aDoneStoryStart(renamedFileCompletedHistory());
  const lineAt = async (line: number) =>
    (await publishedFileAt(renamedNewPath, { line, side: "new" })).file;
  const line11 = await lineAt(11);
  const line12 = await lineAt(12);
  refuseNext();
  await startAt(line11, storyA, "  ");
  const [failed] = (await keptAttempts()) ?? [];
  expect(failed?.outcome).toMatchObject({ kind: "failed", reason: "refused" });

  const other = await startAt(line12, storyA, "  ");
  const resumed = await startAt(line11, storyA, "  ");

  expect(other.kind, JSON.stringify(other)).toBe("accepted");
  expect(resumed.kind, JSON.stringify(resumed)).toBe("accepted");
  const kept = (await keptAttempts()) ?? [];
  expect(kept).toHaveLength(2);
  const again = kept.find((attempt) => attempt.id === failed?.id);
  expect(again?.acceptedAt).toBe(failed?.acceptedAt);
  expect(again?.outcome?.kind).toBe("launched");
  expect(received).toHaveLength(3);
  expect(received[1]?.id).not.toBe(failed?.id);
  expect(received[2]?.id).toBe(failed?.id);
  expect(received[2]?.input).toBe(received[0]?.input);
  expect(received[1]?.input).not.toBe(received[0]?.input);
});
