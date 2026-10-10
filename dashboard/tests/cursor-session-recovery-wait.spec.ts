// Recover keep-wait expiry: when attach cannot settle before the shared
// launch wait, Recover answers failed with Start's instruction-delivery
// wording, leaves the client running, and does not hang it up.
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { startSessionField } from "./launchCardPage.ts";
import { instructionDeliveryTimedOutExplanation } from "../server/hosts/cursor/instructionDelivery.ts";
import {
  expectReadingWithoutScreenLabel,
  instruction,
} from "./support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  endHeldClient,
  keptRecords,
} from "./support/cursorSessionRecovery.ts";
import { expect, test } from "./support/cursorStart.ts";
import { processRunning } from "./support/processGroup.ts";

test.describe("Recover keep-wait expiry", () => {
  // Shorter than the delayed paint so Start and Recover both hit the shared
  // launch wait before keep settles; setup hangs up without waiting on a
  // terminal that Start's timed-out answer never presented.
  test.use({ launchTimeoutMs: 1_500, cursorPaintDelayMs: 3_000 });

  test("Recover answers failed when keep cannot settle before the shared launch wait", async ({
    page,
    dashboard,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    const revision = (await origin.originGit("rev-parse", "main")).trim();
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision,
      repository: "terryyin/open-dough",
      follows: true,
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
    await startSessionField(dialog).fill(instruction);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    const taken = parts(page).taken.locator(".session-entry");
    await expect(taken).toHaveCount(1);
    await endHeldClient(page, cursor, dashboard.home);
    await page.reload();
    const entry = parts(page).taken.locator(".session-entry");
    await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
    await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(1);
    const [record] = keptRecords(dashboard.home);
    if (record?.session.host !== "cursor") {
      throw new Error("Expected a Cursor session.");
    }
    const before = cursor.attaches().length;
    const recoverResponse = page.waitForResponse((response) =>
      response.url().includes("/__agent-launch/recover"),
    );
    const started = Date.now();
    await entry.getByRole("button", { name: "Recover" }).click();
    const recover = await recoverResponse;
    const elapsedMs = Date.now() - started;
    const body = (await recover.json()) as {
      kind: string;
      explanation?: string;
    };
    expect(
      {
        status: recover.status(),
        kind: body.kind,
        explanation: body.explanation,
        elapsedMs,
      },
      "recover keep-wait expiry",
    ).toMatchObject({
      status: 200,
      kind: "failed",
      explanation: instructionDeliveryTimedOutExplanation(record.session),
    });
    expect(elapsedMs).toBeLessThan(3_000);
    await expect.poll(() => cursor.attaches().length).toBe(before + 1);
    const resumed = cursor.attaches().at(-1);
    expect(processRunning(resumed?.pid)).toBe(true);
    expect(cursor.signals(resumed?.pid ?? 0)).not.toMatch(/SIGHUP|SIGTERM/u);
  });
});
