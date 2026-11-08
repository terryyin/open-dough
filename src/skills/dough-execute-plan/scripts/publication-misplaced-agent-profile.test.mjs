// A candidate whose integration moved a live agent profile into done/ is held
// by every publisher, naming the profile and its home in agents/. Real
// completion and manually committed merges against local bare remotes.
import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCheckout } from "./publication-test-fixtures.mjs";
import {
  assertHeld,
  manualMerge,
  publish,
} from "./publication-done-records-fixture.mjs";

for (const file of [".planning/PRODUCT-BACKLOG.md", "delivery/custom.md"]) {
  for (const publisher of ["history", "execution", "resume"]) {
    test(`${publisher} holds a candidate with a live profile under done/ beside ${file}`, async (t) => {
      const fixture = await manualMerge(t, file, "Taken", {
        active: false,
        misplace: true,
      });
      const { profile, misplacedPath } = fixture;
      const before = await captureCheckout(fixture.execution);
      const publishedRevisions = [];

      const result = await publish(publisher, fixture, { publishedRevisions });

      const { misplaced, error } = await assertHeld(
        result,
        "misplaced-agent-profile",
        fixture,
        before,
        publishedRevisions,
      );
      assert.deepEqual(misplaced, [{ path: misplacedPath, home: profile }]);
      assert.ok(error.includes(misplacedPath), error);
      assert.ok(error.includes(profile), error);
    });
  }
}
