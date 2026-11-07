// Last-held session keys under the runner directory: keep publishes a
// key, deliberate /hangup removes it, and killing the runner while
// leaving its address does not clear keys for sessions it held.
import { expect, test } from "../../tests/support/pageTest.ts";
import { hangupCursorClient } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerLastHeld } from "../../server/hosts/cursor/runnerPaths.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import {
  cursorProofSession,
  keepWorkingClient,
  startRunnerProofFixture,
} from "../../tests/support/cursorRunnerProof.ts";
import { killCursorRunnerLeavingAddress } from "../../tests/support/cursorRunnerRecordedAddress.ts";

test("keep publishes last-held keys; hangup removes one; kill-leaving-address retains them", async () => {
  const fixture = startRunnerProofFixture();
  try {
    const firstId = fixture.cursor.sessionId;
    const secondId = "d4e5f6a7-b8c9-4abd-9ef0-123456789abc";
    await keepWorkingClient(fixture, firstId);
    await keepWorkingClient(fixture, secondId);
    const firstKey = sessionKey({ host: "cursor", sessionId: firstId });
    const secondKey = sessionKey({ host: "cursor", sessionId: secondId });
    await expect
      .poll(() => [...readCursorRunnerLastHeld(fixture.home)].sort())
      .toEqual([firstKey, secondKey].sort());

    await hangupCursorClient(
      cursorProofSession(fixture, firstId),
      fixture.home,
    );
    await expect
      .poll(() => readCursorRunnerLastHeld(fixture.home))
      .toEqual([secondKey]);

    await killCursorRunnerLeavingAddress(fixture.home);
    expect(readCursorRunnerLastHeld(fixture.home)).toEqual([secondKey]);
  } finally {
    await fixture.restore();
  }
});
