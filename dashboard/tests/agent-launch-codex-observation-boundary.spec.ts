// Native vendor substitutes reach the real recorded-target HTTP/store boundary.
import path from "node:path";
import { installFakeCodex } from "./support/fakeCodex.ts";
import {
  deleteRecord,
  launch,
  refinementRequest,
} from "./agentLaunchBoundary.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { publishLaunchJourney, notRefinedStory } from "./launchJourney.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { passive as passiveReport } from "./support/retainedReport.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observationStates as states,
  observed,
  passive,
} from "./support/codexObservation.ts";
test.use({ projectFolders: ["open-dough"] });

test("predecessor without continuation gains no command; missing workspace preserves passive final-report access", async ({
  page,
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture");
  test.setTimeout(120_000);
  const journey = await publishLaunchJourney();
  try {
    const legacy = record(dashboard, native, "legacy-no-continuation");
    delete legacy.session.continuation;
    const missing = record(dashboard, native, native.threadId);
    if (missing.session.continuation === undefined)
      throw new Error("Missing continuation");
    missing.session.continuation.workspace = path.join(
      dashboard.home,
      "retired-workspace",
    );
    native.cwd = missing.session.continuation.workspace;
    native.history = [
      {
        id: "final-turn",
        status: "completed",
        items: [
          {
            type: "agentMessage",
            phase: "final_answer",
            text: "The saved conversation's final report.",
          },
        ],
      },
    ];
    observed(native, native.threadId, { type: "notLoaded" }, "completed");
    save(dashboard, [legacy, missing]);
    const before = stored(dashboard.home);
    const { card } = await openTakenBacklog(page, journey);
    const entries = () => [
      cardSessions(card(notRefinedStory)),
      parts(page).recentSessions.getByRole("article"),
    ];
    const check = async () => {
      for (const list of entries()) {
        for (const id of [
          legacy.session.sessionId,
          missing.session.sessionId,
        ]) {
          const entry = list.filter({
            has: page.locator(`code:text-is("${id}")`),
          });
          await expect(
            entry.locator("p", { hasText: /^Continue in / }),
          ).toHaveCount(0);
          await expect(
            entry.getByRole("button", { name: "Open terminal" }),
          ).toHaveCount(0);
          await expect(
            entry.getByRole("button", { name: "Read final report" }),
          ).toBeVisible();
          await expect(
            entry.locator("p", { hasText: /^Workspace / }),
          ).toHaveCount(id === legacy.session.sessionId ? 0 : 1);
          await expect(entry).toContainText(
            id === legacy.session.sessionId
              ? "saved workspace availability could not be established"
              : "saved workspace is missing",
          );
        }
      }
    };
    await check();
    await page.reload();
    await check();
    expect(stored(dashboard.home)).toEqual(before);
    passive(native.calls);
    for (const list of entries()) {
      await list
        .filter({
          has: page.locator(`code:text-is("${missing.session.sessionId}")`),
        })
        .getByRole("button", { name: "Read final report" })
        .click();
      const panel = page.getByRole("region", { name: "Final report" });
      await expect(panel.locator(".session-final-report")).toHaveText(
        "The saved conversation's final report.",
      );
      await panel.getByRole("button", { name: "Close", exact: true }).click();
    }
    expect(stored(dashboard.home)).toEqual(before);
    passiveReport(native, 0);
  } finally {
    await journey.cleanup();
  }
});

test("endpoint/read failures preserve healthy hosts, saved identity and independent native targets", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  dashboard.claudeScenario("launched");
  expect((await launch(dashboard, refinementRequest)).status).toBe(200);
  const claude = stored(dashboard.home)[0];
  if (claude === undefined) throw new Error("Missing Claude record");
  observed(native, "healthy", { type: "notLoaded" }, "completed");
  observed(native, "refused", { type: "idle" });
  native.observations.set("refused", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "Native read refused" },
  });
  const badEndpoint = record(dashboard, native, "bad-endpoint");
  if (badEndpoint.session.continuation === undefined)
    throw new Error("Missing continuation");
  badEndpoint.session.continuation.endpoint = `unix://${dashboard.home}/absent.sock`;
  const legacy = record(dashboard, native, "legacy-no-endpoint");
  delete legacy.session.continuation;
  save(dashboard, [
    claude,
    record(dashboard, native, "healthy"),
    record(dashboard, native, "refused"),
    badEndpoint,
    legacy,
  ]);
  const response = await states(dashboard);
  expect(response.map((r) => [r.session.sessionId, r.sessionState])).toEqual([
    [
      claude.session.sessionId,
      { kind: "available", availability: "loaded", activity: "working" },
    ],
    [
      "healthy",
      { kind: "available", availability: "retained", activity: "review" },
    ],
    ["refused", { kind: "unknown" }],
    ["bad-endpoint", { kind: "unknown" }],
    ["legacy-no-endpoint", { kind: "unknown" }],
  ]);
  expect(stored(dashboard.home)).toHaveLength(5);
  passive(native.calls);
});

test("deleting an unreadable saved record while another passive read is pending never recreates it", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  native.observations.set("held", {
    status: { type: "idle" },
    turns: [],
    holdRead: true,
  });
  save(dashboard, [record(dashboard, native, "held")]);
  const pending = states(dashboard);
  await expect
    .poll(() => native.calls.filter((c) => c.method === "thread/read").length)
    .toBe(1);
  // A second boundary read is explicitly unreadable, admitting established deletion.
  native.observations.set("held", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "Native read refused" },
  });
  expect(
    (
      await deleteRecord(dashboard, {
        source: "open-dough",
        host: "codex",
        session: "held",
      })
    ).status,
  ).toBe(200);
  native.releaseReads();
  await pending;
  expect(stored(dashboard.home)).toEqual([]);
  expect(await states(dashboard)).toEqual([]);
  passive(native.calls);
});

test("a silent native endpoint reaches its bound without erasing a healthy Codex endpoint", async ({
  dashboard,
  machine,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined || machine === undefined)
    throw new Error("Missing native fixture");
  const silent = await installFakeCodex(
    path.join(machine, "silent"),
    process.env["PATH"] ?? "",
    true,
  );
  try {
    observed(native, "healthy", { type: "notLoaded" }, "completed");
    silent.observations.set("silent", {
      status: { type: "idle" },
      turns: [],
      holdRead: true,
    });
    save(dashboard, [
      record(dashboard, native, "healthy"),
      record(dashboard, silent, "silent"),
    ]);
    expect(
      (await states(dashboard)).map((r) => [
        r.session.sessionId,
        r.sessionState,
      ]),
    ).toEqual([
      [
        "healthy",
        { kind: "available", availability: "retained", activity: "review" },
      ],
      ["silent", { kind: "unknown" }],
    ]);
    await expect.poll(() => silent.sockets.size).toBe(0);
    passive(native.calls);
    passive(silent.calls);
  } finally {
    await silent.close();
  }
});
