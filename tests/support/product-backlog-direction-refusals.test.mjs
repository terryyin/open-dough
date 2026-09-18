// Runs the real backlog CLI against requests that name a direction the backlog
// no longer carries, or that leave what the update should do unstated, and
// observes that each one is refused with the whole file unchanged.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  backlog,
  backlogOf,
  direction,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";

const set = (...rest) => ["direction", ...rest];

const chosen =
  "Make every ordinary backlog change a scripted, validated operation,\n" +
  "so no agent has to hand-edit the shared list to reprioritize work.";

// A backlog carrying no direction section at all.
const undirected = backlogOf([takenEntry], queued, "");

test("direction update refuses a stale expectation with nothing written", async (t) => {
  const refusals = [
    {
      why: "an expectation naming text the backlog no longer carries",
      source: backlog,
      arguments_: set("--expect", chosen, "--text", "Something else."),
      expect:
        /The direction this request was written against is not the direction the backlog carries, so nothing was written\./,
    },
    {
      why: "expecting no direction when the backlog carries one",
      source: backlog,
      arguments_: set("--expect-none", "--text", chosen),
      expect: /Expected:\n {2}\(no direction\)\nFound:\n {2}Enable agents/,
    },
    {
      why: "expecting a direction when the backlog carries none",
      source: undirected,
      arguments_: set("--expect", direction, "--text", chosen),
      expect: /Found:\n {2}\(no direction\)/,
    },
    {
      why: "a stale expectation on a clear",
      source: backlog,
      arguments_: set("--expect", chosen, "--clear"),
      expect: /is not the direction the backlog carries/,
    },
    {
      why: "an expectation differing only in its wrapping",
      source: backlog,
      arguments_: set(
        "--expect",
        direction.replace("\n", " "),
        "--text",
        chosen,
      ),
      expect: /is not the direction the backlog carries/,
    },
  ];

  for (const refusal of refusals) {
    const project = scratchProject(t, refusal.source);
    const result = await run(project, refusal.arguments_);
    assert.equal(result.code, 1, `${refusal.why}: expected a refusal`);
    assert.match(result.stderr, refusal.expect, refusal.why);
    assert.match(result.stderr, /The backlog was not changed\./, refusal.why);
    assert.equal(
      project.read(),
      refusal.source,
      `${refusal.why}: file changed`,
    );
  }
});

test("direction update refuses an unstated or unrecordable request unchanged", async (t) => {
  const refusals = [
    {
      why: "no stated expectation",
      arguments_: set("--text", chosen),
      expect:
        /Supply exactly one of --expect <text> or --expect-none, so that a direction update always states the direction it was written against\./,
    },
    {
      why: "both expectations stated",
      arguments_: set("--expect", direction, "--expect-none", "--text", chosen),
      expect: /Supply exactly one of --expect <text> or --expect-none/,
    },
    {
      why: "an empty expectation",
      arguments_: set("--expect", "", "--text", chosen),
      expect:
        /Missing expect: supply --expect\. Expecting no direction at all is its own request: supply --expect-none\./,
    },
    {
      why: "neither text nor clear",
      arguments_: set("--expect", direction),
      expect:
        /Supply exactly one of --text <text> or --clear, so that a direction update always states what the direction should say\./,
    },
    {
      why: "both text and clear",
      arguments_: set("--expect", direction, "--text", chosen, "--clear"),
      expect: /Supply exactly one of --text <text> or --clear/,
    },
    {
      why: "empty text",
      arguments_: set("--expect", direction, "--text", ""),
      expect:
        /Missing text: supply --text\. Removing the direction is its own request: supply --clear\./,
    },
    {
      why: "text padded with a blank line",
      arguments_: set("--expect", direction, "--text", `\n${chosen}\n`),
      expect:
        /would not read back as it was supplied, so nothing was written\..*never reflowed or tidied here/s,
    },
    {
      why: "text carrying a heading of its own",
      arguments_: set("--expect", direction, "--text", `## Later\n\n${chosen}`),
      expect: /would not read back as it was supplied/,
    },
    {
      why: "text that would make a second list",
      arguments_: set("--expect", direction, "--text", "## Taken"),
      expect: /Expected exactly one "## Taken" section; found 2\./,
    },
  ];

  for (const refusal of refusals) {
    const project = scratchProject(t);
    const result = await run(project, refusal.arguments_);
    assert.equal(result.code, 1, `${refusal.why}: expected a refusal`);
    assert.match(result.stderr, refusal.expect, refusal.why);
    assert.match(result.stderr, /The backlog was not changed\./, refusal.why);
    assert.equal(project.read(), backlog, `${refusal.why}: file changed`);
  }
});
