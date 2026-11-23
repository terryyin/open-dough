import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { publishSessionClose } from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import {
  git,
  lsRemoteSha,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  closedAt,
  landed,
  nativeSession,
  publishedRecord,
  targetRef,
} from "./session-close-test-fixtures.mjs";

test("a follow-up publishes its association before the originating session publishes the Done story", async (t) => {
  const original = makeMe.aSessionRecord.please();
  const story = `ad-hoc#${original.sessionId}`;
  const { fixture, closed: followUp } = await landed(t, {
    sessionId: nativeSession,
    story,
    title: "Refine the notes",
  });
  assert.equal(followUp.record.status, "published", JSON.stringify(followUp));
  const earlierClose = await publishedRecord(fixture);
  assert.equal(JSON.parse(earlierClose).story, story);
  assert.equal(
    (await git(fixture.origin, "ls-tree", "main", ".planning/done")).stdout,
    "",
  );

  const base = await lsRemoteSha(fixture.origin, targetRef);
  await writeFile(
    join(fixture.execution, "release-notes.txt"),
    "Initial release notes\n",
  );
  await git(fixture.execution, "add", "release-notes.txt");
  await git(
    fixture.execution,
    "commit",
    "-m",
    "Keep the original release notes",
  );
  const result = await publishSessionClose({
    ...makeMe.anIncrementPublication
      .with({
        branch: "land/ad-hoc",
        previouslyPublishedBase: base,
        targetRef,
      })
      .please(),
    workspace: fixture.execution,
    session: {
      workflow: "ad-hoc",
      sessionId: original.sessionId,
      title: "Write release notes",
    },
    now: () => closedAt,
  });
  assert.equal(result.record.status, "published", JSON.stringify(result));
  assert.equal(
    JSON.parse(await publishedRecord(fixture, original.sessionId)).story,
    story,
  );
  assert.equal(await publishedRecord(fixture), earlierClose);
  const catalog = await git(
    fixture.origin,
    "show",
    "main:.planning/done/.catalog.json",
  );
  assert.deepEqual(
    JSON.parse(catalog.stdout).records.map(({ identity }) => identity),
    [story],
  );
});
