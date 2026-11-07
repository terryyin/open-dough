// The common page displays a stand-in host's supplied inspection arguments
// from a synthetic creation view — no native creation store or dashboardServer.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import {
  emptyMachineAnswer,
  putFrontendMachine,
} from "../tests/support/frontendServiceState.ts";
import { launchRecordsSchema } from "../src/agentLaunch.ts";
import { creationSchema } from "../src/launchCreation.ts";
import { creationView } from "../server/launchCreation.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";

test("the common page displays a stand-in host's supplied inspection arguments", async ({
  page,
  frontendServices,
}) => {
  const args = ["/native space's tool", "history", "$(literal)", "a'b", ""];
  const record = creationSchema.parse({
    request: {
      source: "open-dough",
      host: "codex",
      workflow: "ad-hoc",
      title: "Stand-in inspection",
      instruction: "Inspect.",
    },
    creation: {
      workspace: "/saved workspace",
      endpoint: "unix:///saved endpoint",
    },
    launchedAt: "2026-10-01T00:00:00.000Z",
  });
  const view = creationView(record, {
    name: "Stand-in native host",
    creationEvidence: () => ({
      inspectionArgs: args,
      unreadableAdvice: "Inspect native history.",
    }),
  });
  putFrontendMachine(
    frontendServices,
    launchRecordsSchema.parse({
      ...emptyMachineAnswer(),
      creations: [view],
    }),
  );
  await openFrontendTakenBacklog(page);
  const entry = page.getByRole("article", {
    name: "Stand-in inspection unresolved creation",
  });
  await expect(entry).toBeVisible();
  await expect(entry).toContainText(
    "Conversation creation in Stand-in native host unresolved",
  );
  await expect(entry.locator("code").last()).toHaveText(shellCommand(args));
  await expect(entry).not.toContainText("Codex");
});
