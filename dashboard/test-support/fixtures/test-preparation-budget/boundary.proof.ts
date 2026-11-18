// A boundary-only case starts its server through the ordinary dashboard
// fixture, so the outer proof (runtime/test-preparation-boundary.spec.ts)
// observes what common server-input readiness prepares for boundary mode.
import { expect, test } from "../../dashboardTest.ts";

test.use({ serverMode: "boundary" });

test("a boundary-only case starts its server", ({ dashboard }) => {
  expect(dashboard.serverBundle).toBeDefined();
  expect(dashboard.outDir).toBeUndefined();
});
