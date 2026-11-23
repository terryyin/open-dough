// Reconciliation reports the disputed intention or malformed input version.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  architecture,
  backlog,
  backlogOf,
  queued,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { mergeRefusal } from "./product-backlog-merge-fixture.mjs";

const [trunk, retrospective, review] = queued;

test("merge items refuses two different changes to one work item", () => {
  const rename = (title) =>
    backlogOf(
      [takenEntry],
      [
        trunk,
        retrospective,
        review.replace(
          "Strengthen architectural review after using the lightweight guidance",
          title,
        ),
      ],
    );

  const refused = mergeRefusal(
    backlog,
    rename("Strengthen review one"),
    rename("Strengthen review two"),
  );

  assert.match(
    refused,
    new RegExp(`"${architecture}": the versions give it different titles`),
  );
  assert.match(
    refused,
    /"Strengthen review one" and .* has "Strengthen review two"/,
  );
});

test("merge items refuses writing a version holds between the two lists", () => {
  // A merge rewrites the run of sections from the direction to the end of the
  // queue, so a section wedged into that run is refused rather than dropped.
  const wedged = backlog.replace(
    "## Backlog list\n",
    "## Notes\n\nSomebody's working notes.\n\n## Backlog list\n",
  );

  const refused = mergeRefusal(backlog, wedged, backlog);

  assert.match(refused, /do not come one after another, in that order\./);
  assert.match(refused, /would not survive it/);
});

test("merge items refuses a closure against an explicit return to the queue", () => {
  const refused = mergeRefusal(
    backlog,
    // One branch closed the taken story.
    backlogOf([], queued),
    // The other returned it to the queue, carrying its line across.
    backlogOf([], [takenEntry, ...queued]),
  );

  assert.match(
    refused,
    /removes it while .* changes it\. Removing work and changing it are different intentions/,
  );
});

test("merge items refuses a version it cannot read", () => {
  const prose = backlog.replace(
    "## Backlog list\n\n",
    "## Backlog list\n\nStories we might do next:\n\n",
  );
  const malformed = mergeRefusal(backlog, prose, backlog);
  assert.match(
    malformed,
    /the first branch version is not a backlog this tool can read/,
  );
  assert.match(malformed, /Unsupported text in "## Backlog list"/);

  const twice = backlogOf([takenEntry], [trunk, retrospective, trunk]);
  const duplicate = mergeRefusal(backlog, twice, backlog);
  assert.match(duplicate, /already lists the same work twice/);
});

test("merge items refuses one branch saying two things about one work item", () => {
  // The entry is listed once on each side, but the branch's refreshed link and
  // its re-added old home are the same work: across the versions they chain
  // together, and no merge rule establishes which of the two it meant.
  const home =
    "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes";
  const moved =
    "seeds/SEED-009-release-the-guidance.md#publish-the-release-notes";
  const ancestor = backlogOf([takenEntry], [`- [Notes](${home}) — SEED-002`]);

  const refused = mergeRefusal(
    ancestor,
    backlogOf(
      [takenEntry],
      [`- [Notes](${moved}) — SEED-002`, `- [Notes](${home})`],
    ),
    ancestor,
  );

  assert.match(
    refused,
    /separately, but across the supplied versions they name one work item/,
  );
});
