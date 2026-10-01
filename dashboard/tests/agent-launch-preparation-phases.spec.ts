// Both hosts traverse real installed start, publication and native launch phases.
import { test } from "./support/preparationPage.ts";
import { expectStartProgress } from "./support/startProgressPage.ts";

for (const host of ["claude", "codex"] as const) {
  test.describe(host, () => {
    test.use({ preparationHost: host });
    test("initiating and observing pages show the actual host throughout refinement progress", async ({
      page,
      dashboard,
      origin,
      codexProtocol,
    }) => {
      await expectStartProgress(
        { page, dashboard, origin, codexProtocol },
        "refinement",
        host,
      );
    });
  });
}
