// One-shot guidance: the start asks for workspace authority alone, the
// verified result waits in its workspace for review, and only an explicit
// landing request or selected automatic landing publishes it, including a
// queued story's closure.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const reference = readFileSync(join(skill, "references/one-shot.md"), "utf8");

test("the one-shot start asks for workspace authority, not publication authority", () => {
  const start = section(reference, "## Start in an owned workspace");
  assert.match(start, /`--workspace-authorized`/);
  assert.doesNotMatch(start, /--push-authorized/);
  assert.match(start, /not to publish/);
});

test("a verified one-shot result stops for review in its retained workspace", () => {
  const retain = section(reference, "## Verify and retain the result");
  assert.match(retain, /stop for review/);
  assert.match(retain, /`startingRevision`/);
  assert.match(retain, /nothing is pushed or retired/);
  assert.match(retain, /still lists[\s\S]+closure waits/);
  assert.doesNotMatch(retain, /increment publication|deliver/i);
});

test("only an explicit landing request delivers the retained result", () => {
  const land = section(reference, "## Land the retained result");
  assert.match(land, /explicitly asks to land the retained result/);
  assert.match(
    land,
    /`previouslyPublishedBase` set to the retained `startingRevision`/,
  );
  const queued = section(
    reference,
    "## Complete a queued story in the same commit",
  );
  assert.match(queued, /When landing it, add `--one-shot-identity/);
});

test("a queued no-change closure waits for review like any result", () => {
  const none = section(reference, "## Finish with no change");
  assert.match(
    none,
    /stop for review as for any result; it lands only on request or under\s+selected automatic landing/,
  );
  const retire = section(reference, "## Retire the workspace");
  assert.match(retire, /landed result's delivery and CI completion/);
});

test("selected default checkout work takes that checkout as it is and keeps it", () => {
  const direct = section(reference, "## Work in the default checkout");
  assert.match(direct, /`--one-shot --default-main`/);
  assert.match(direct, /actual path and current branch/);
  assert.match(direct, /nothing is reset, refreshed, created, or published/);
  assert.match(direct, /need no clean checkout or confirmation/);
  assert.match(direct, /all checkout content is committed together/);
  assert.match(direct, /leave switching branches[\s\S]+to the developer/);
  const land = section(reference, "## Land the retained result");
  assert.match(land, /merge base of its HEAD and fetched\s+trunk/);
  const retire = section(reference, "## Retire the workspace");
  assert.match(retire, /default checkout is never retired/);
});

test("selected automatic landing publishes the verified result without review, and stops on any blocker", () => {
  const retain = section(reference, "## Verify and retain the result");
  assert.match(retain, /unless automatic landing was selected/);
  const auto = section(reference, "## Land automatically when selected");
  assert.match(auto, /`--auto-land\s+--push-authorized`/);
  assert.match(auto, /`landing: "auto-land"`/);
  assert.match(auto, /never selects automatic landing/);
  assert.match(auto, /Tracked work refuses\s+`--auto-land`/);
  assert.match(auto, /verification passes[\s\S]+refactor pass[\s\S]+decision/);
  assert.match(
    auto,
    /\[Land the retained result\]\(#land-the-retained-result\)/,
  );
  assert.match(auto, /`--one-shot-identity`/);
  assert.match(auto, /all checkout content is committed together/);
  assert.match(auto, /remote acceptance alone completes neither/);
  assert.match(
    auto,
    /`ownership-changed`[\s\S]+`conflict`[\s\S]+second rejection\. Push nothing more/,
  );
  assert.match(auto, /resumes the retained candidate/);
  assert.match(auto, /the default checkout\s+stays/);
});
