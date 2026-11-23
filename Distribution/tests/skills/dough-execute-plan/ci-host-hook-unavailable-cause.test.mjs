import assert from "node:assert/strict";
import { test } from "node:test";
import { publishMailboxEvent } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-store.mjs";
import { createMailbox } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";

import {
  context,
  input,
  runHostHook,
  setup,
} from "./ci-host-hook-test-fixtures.mjs";

for (const host of ["cursor", "claude"]) {
  for (const [cause, reason] of [
    ["budget_expired", "Execution observation budget expired after 5000 ms."],
    ["observation_error", "TLS handshake timeout"],
  ]) {
    test(`${host}: unavailable notification text names ${cause}`, async () => {
      const options = setup();
      const directory = createMailbox({}, options);
      await runHostHook(host, input(host, directory), options);
      publishMailboxEvent(directory, {
        type: "CI_MONITOR_UNAVAILABLE",
        repo: "owner/repo",
        reason,
        cause,
      });
      const text = context(await runHostHook(host, input(host), options));
      assert.match(text, /"type":"CI_MONITOR_UNAVAILABLE"/);
      assert.match(text, new RegExp(`"cause":"${cause}"`));
      assert.match(
        text,
        new RegExp(reason.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    });
  }
}
