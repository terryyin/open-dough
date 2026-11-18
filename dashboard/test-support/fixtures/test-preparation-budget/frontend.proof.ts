// A frontend case starts the static app through the ordinary frontendApp
// fixture, so the outer proof (runtime/test-preparation-frontend.spec.ts)
// observes what common app readiness prepares for a frontend run.
import { expect, test } from "../../support/frontendApp.ts";

test("a frontend case serves the built app", ({ frontendApp }) => {
  expect(frontendApp.outDir).toBeDefined();
});
