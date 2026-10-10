// Guidance structure (not proof an agent follows the text): the owner input
// of `deliver`, `resume`, and `finish` names the calling coordinator itself,
// and a session that replaces a coordinator establishes its own observer,
// because an observer's events reach only the session that claimed it.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const references = join(
  dirname(fileURLToPath(import.meta.url)),
  "../references",
);
const read = (name) => readFileSync(join(references, name), "utf8");

// Prose is matched across its line wrapping.
const flat = (text) => text.replace(/\s+/g, " ");

const trunk = read("trunk-publication.md");
const closure = flat(
  section(
    read("wrap-up-closure-publication.md"),
    "## Finish Trunk Mode closure",
  ),
);
const hosts = flat(read("ci-notify-hosts.md"));
const publish = flat(section(trunk, "## Publish the candidate"));
const resume = flat(section(trunk, "## Resume an interrupted publication"));

test("session JSON names the calling coordinator, with the agent_id its observer was claimed with, and never an earlier session", () => {
  for (const guidance of [publish, resume, closure, hosts]) {
    assert.doesNotMatch(
      guidance,
      /naming the session|name a different owner|names the session whose|not that session/,
    );
  }
  assert.match(
    publish,
    /`--session-json` names that same coordinator from a call that lacks its identity/,
  );
  assert.match(
    publish,
    /names the session alone[\s\S]+claimed with an `agent_id`[\s\S]+`--session-json` with both[\s\S]+`deliver`, `resume`, and `finish`/,
  );
  assert.match(publish, /malformed session JSON stops delivery/);
  for (const guidance of [resume, closure, hosts]) {
    assert.match(
      guidance,
      /claimed with[\s\S]*`agent_id`|`agent_id` its observer was claimed with/,
    );
    assert.doesNotMatch(guidance, /subagent coordinator|parent's/);
  }
});

test("the receipt names the session that receives an observer's events", () => {
  assert.match(
    publish,
    /`observation\.notifies`[\s\S]+only session whose tool calls receive that observer's events/,
  );
  assert.match(
    hosts,
    /An observer's events reach only the session that claimed it/,
  );
});

test("a session that replaces a coordinator stops the recorded observer and delivers to establish its own", () => {
  const replacement =
    /session that replaces (?:a|the) coordinator[\s\S]+stop[\s\S]+recorded[\s\S]+`deliver`[\s\S]+establishes its own/;
  for (const guidance of [publish, resume, closure, hosts]) {
    assert.match(guidance, replacement);
  }
  assert.match(resume, /reruns the same resume/);
  assert.match(
    closure,
    /`step: "observation"`[^|]+\|[^|]+`observation\.reason`[^|]+stop the recorded observer[^|]+`deliver`[^|]+lost coverage/,
  );
});
