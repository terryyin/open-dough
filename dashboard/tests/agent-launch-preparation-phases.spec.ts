// Codex refinement traverses real installed start, publication and native
// launch phases. Claude execution's journey is ./agent-launch-start-phases.spec.ts.
import { test } from "./support/preparationPage.ts";
import { expectStartProgress } from "./support/startProgressPage.ts";

test.use({ preparationHost: "codex" });

test("initiating and observing pages show Codex throughout refinement progress", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  await expectStartProgress(
    { page, dashboard, origin, codexProtocol },
    "refinement",
    "codex",
  );
});
