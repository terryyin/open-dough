// Recovery presentation can read a known host with no native-check advice.
// Synthetic launch-record answers only; no dashboard backend or native host.

import { launchRecordsSchema } from "../src/agentLaunch.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import {
  emptyMachineAnswer,
  putFrontendMachine,
} from "../tests/support/frontendServiceState.ts";
import { readyStory } from "../tests/launchJourney.ts";
import { parts } from "../tests/dashboardPage.ts";
import { recoveryOf } from "../tests/responsiveRecovery.ts";
import { reloadUntilRead } from "../tests/pageRequestNotes.ts";

test("without a reported phase, story startup keeps its host and the installed start's Preparing versus Starting choice", async ({
  page,
  frontendServices,
}) => {
  await openFrontendTakenBacklog(page);
  const starting = parts(page).backlog.getByRole("article", {
    name: readyStory,
  });
  for (const host of ["claude", "codex"] as const) {
    for (const workflow of ["execution", "refinement"] as const) {
      for (const establishes of [false, true]) {
        putFrontendMachine(
          frontendServices,
          launchRecordsSchema.parse({
            ...emptyMachineAnswer(),
            starts: [],
            establishing:
              establishes && workflow === "execution" ? ["open-dough"] : [],
            establishingPreparation:
              establishes && workflow === "refinement" ? ["open-dough"] : [],
            establishingHosts: establishes
              ? [{ source: "open-dough", host, workflow }]
              : [],
            attempts: [
              {
                id: "12345678-1234-4123-8123-123456789abc",
                request: {
                  source: "open-dough",
                  identity: "SEED-B#b",
                  title: readyStory,
                  host,
                  workflow,
                },
                acceptedAt: "2026-10-02T00:00:00.000Z",
                publication: { kind: "none" },
                owned: true,
                running: true,
              },
            ],
          }),
        );
        await reloadUntilRead(page);
        const words = establishes
          ? `Preparing ${workflow}…`
          : `Starting ${workflow} in ${host === "claude" ? "Claude Code" : "Codex"}…`;
        await expect(starting.locator(".launch-answer")).toHaveText(words);
        await expect(starting).toContainText(
          "Local startup in progress; this story's actions are unavailable until it settles.",
        );
        await expect(
          starting.getByRole("button", { name: "Start execution" }),
        ).toBeDisabled();
        await expect(
          starting.getByRole("button", { name: "Start refinement" }),
        ).toBeDisabled();
        await expect(starting).not.toContainText(
          "Startup needs reconciliation",
        );
        await expect(starting).not.toContainText(
          "Waiting for published story state",
        );
      }
    }
  }
});

test("a recovery host without native-check advice keeps its controls without borrowed advice or a description reference", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(
    frontendServices,
    launchRecordsSchema.parse({
      ...emptyMachineAnswer(),
      attempts: [
        {
          id: "12345678-1234-4123-8123-123456789abc",
          request: {
            source: "open-dough",
            host: "cursor",
            workflow: "ad-hoc",
          },
          acceptedAt: "2026-10-02T00:00:00.000Z",
          publication: { kind: "none" },
          owned: false,
          running: false,
        },
      ],
    }),
  );
  await openFrontendTakenBacklog(page);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Ad hoc session · session start in Cursor",
  );
  await expect(recovery).toContainText("It never settled.");
  await expect(
    recovery.getByRole("button", { name: "Recheck Ad hoc session" }),
  ).toBeEnabled();
  const continueStart = recovery.getByRole("button", {
    name: "Continue session start of Ad hoc session",
  });
  await expect(continueStart).toBeEnabled();
  await expect(recovery).not.toContainText("before continuing");
  await expect(recovery.locator('[id$="-check"]')).toHaveCount(0);
  await expect(continueStart).not.toHaveAttribute("aria-describedby");
  await expect(continueStart).toHaveAccessibleDescription("");
});
