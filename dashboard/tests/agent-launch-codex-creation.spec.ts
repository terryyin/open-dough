// Protocol evidence decides whether Start may reuse the saved first input.
import { chmodSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import {
  publishLaunchJourney,
  notRefinedIdentity,
  notRefinedStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  launch,
  refinementRequest,
  machineSessions,
} from "./agentLaunchBoundary.ts";
import { test, expect } from "./support/codexLaunch.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
const request = {
  ...refinementRequest,
  host: "codex",
  identity: notRefinedIdentity,
  title: notRefinedStory,
  instruction: "Preserve this exact intent.",
};
test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney | undefined;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => journey?.cleanup());

test("lost creation identity persists reconciliation requirement across server restart", async ({
  page,
  dashboard,
  codexProtocol: protocol,
  machine,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  if (journey === undefined) throw new Error("Missing published journey.");
  const { card } = await openTakenBacklog(page, journey);
  native.loseCreation = true;
  const answer = JSON.parse((await launch(dashboard, request)).body) as {
    kind: string;
    explanation: string;
  };
  expect(answer.kind).toBe("uncertain");
  expect(answer.explanation).toContain("trustworthy conversation identity");
  expect(await machineSessions(dashboard)).toEqual([]);
  const disk = JSON.parse(
    readFileSync(
      path.join(dashboard.home, ".open-dough/dashboard/agent-launches.json"),
      "utf8",
    ),
  ) as Record<string, unknown[]>;
  expect(disk["open-dough"]).toEqual([
    expect.objectContaining({
      request: expect.objectContaining({ host: "codex" }),
      creation: {
        workspace: path.join(dashboard.home, "git/open-dough"),
        endpoint: `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
      },
    }),
  ]);
  await dashboard.close();
  native.loseCreation = false;
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine,
    github: dashboard.github,
    codexProtocol: protocol,
  });
  try {
    const retry = JSON.parse((await launch(restarted, request)).body) as {
      kind: string;
      explanation: string;
    };
    expect(retry.kind).toBe("uncertain");
    expect(retry.explanation).toContain(
      "reconcile this machine's launch evidence with it",
    );
    expect(retry.explanation).toContain(
      path.join(restarted.home, "git/open-dough"),
    );
    const port = Number(new URL(restarted.baseURL).port);
    await openUntilRead(page, `http://localhost:${port}/`);
    const pending = page.getByRole("article", {
      name: `${notRefinedStory} unresolved creation`,
    });
    await expect(pending).toHaveCount(2);
    await expect(pending.first()).toContainText(
      "No trustworthy conversation ID was returned",
    );
    await expect(pending.first()).toContainText(
      path.join(restarted.home, "git/open-dough"),
    );
    await expect(pending.first()).toContainText(
      "Conversation creation in Codex unresolved",
    );
    expect(
      await card(notRefinedStory)
        .getByRole("article", {
          name: `${notRefinedStory} unresolved creation`,
        })
        .count(),
    ).toBe(1);
    const picker =
      (await pending.first().locator("code").allTextContents())[1] ?? "";
    execFileSync("/bin/sh", ["-c", picker], {
      env: { ...process.env, ...native.env },
      stdio: "pipe",
    });
    expect(
      JSON.parse(readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8")),
    ).toEqual([
      "resume",
      "--remote",
      `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
      "--cd",
      path.join(restarted.home, "git/open-dough"),
      "--include-non-interactive",
    ]);
    expect(await machineSessions(restarted)).toEqual([]);
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(0);
    expect(
      JSON.parse(
        readFileSync(
          path.join(
            restarted.home,
            ".open-dough/dashboard/agent-launches.json",
          ),
          "utf8",
        ),
      ),
    ).toEqual(disk);
  } finally {
    await restarted.close();
  }
});

test("failed identity recording prevents first input and explains the exact known continuation", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const directory = path.join(dashboard.home, ".open-dough/dashboard");
  native.threadId = "known id's identity";
  native.afterCreation = () => {
    chmodSync(directory, 0o555);
  };
  try {
    const result = JSON.parse((await launch(dashboard, request)).body) as {
      kind: string;
      explanation: string;
    };
    expect(result.kind).toBe("uncertain");
    expect(result.explanation).toContain(native.threadId);
    expect(result.explanation).toContain("No first input was submitted");
    expect(result.explanation).toContain("could not be saved");
    expect(result.explanation).toContain("'codex' 'resume' '--remote'");
    const command = result.explanation.split("`")[1];
    expect(command).toBeDefined();
    execFileSync("/bin/sh", ["-c", command ?? ""], {
      env: { ...process.env, ...native.env },
      stdio: "pipe",
    });
    expect(
      JSON.parse(readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8")),
    ).toEqual([
      "resume",
      "--remote",
      `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
      "--cd",
      path.join(dashboard.home, "git/open-dough"),
      native.threadId,
    ]);
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(0);
    expect(await machineSessions(dashboard)).toEqual([]);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    chmodSync(directory, 0o755);
  }
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
});
