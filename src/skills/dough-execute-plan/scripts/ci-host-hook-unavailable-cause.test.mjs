import assert from "node:assert/strict";
import { test } from "node:test";
import { deliverCiEvents } from "./ci-host-hook.mjs";
import { createMailbox, publishMailboxEvent } from "./ci-mailbox.mjs";
import { context, input, setup } from "./ci-host-hook-test-fixtures.mjs";

for (const host of ["cursor", "claude"]) {
  for (const [cause, reason] of [
    ["budget_expired", "Execution observation budget expired after 5000 ms."],
    ["observation_error", "TLS handshake timeout"],
  ]) {
    test(`${host}: unavailable notification text names ${cause}`, () => {
      const options = setup();
      const directory = createMailbox({}, options);
      deliverCiEvents(input(host, directory), host, options);
      publishMailboxEvent(directory, {
        type: "CI_MONITOR_UNAVAILABLE",
        repo: "owner/repo",
        reason,
        cause,
      });
      const text = context(deliverCiEvents(input(host), host, options));
      assert.match(text, /"type":"CI_MONITOR_UNAVAILABLE"/);
      assert.match(text, new RegExp(`"cause":"${cause}"`));
      assert.match(
        text,
        new RegExp(reason.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    });
  }
}
