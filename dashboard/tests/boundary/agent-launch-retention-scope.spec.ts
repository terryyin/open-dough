// Retention expiry is a record removal too (plan 329 slice 4): a scoped
// Cursor record a write drops past its 30-day retention retires exactly
// its configuration scope through the same host dispatch as an explicit
// deletion, while retained records keep their scopes and the shared
// Cursor configuration and saved conversation stay untouched. Over raw
// HTTP at the local launch boundary, on a fresh machine directory the
// test owns; the write that drops the expired record is an ordinary
// Claude launch, so the dispatch is host-neutral by construction.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { launch } from "../agentLaunchBoundary.ts";
import {
  daysAgo,
  openStoryRecord,
  seedStore,
  storedRecords,
} from "../machineLaunchRecords.ts";
import { distinctStoryRequest } from "../openStorySessionSetup.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";

test.describe("a scoped record dropped by retention expiry", () => {
  test.describe.configure({ mode: "serial" });
  let machine: string;
  let server: DashboardServer;

  test.beforeAll(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-retention-scope-"));
    server = await startDashboardServer({
      mode: "boundary",
      machine,
      projectFolders: ["open-dough"],
    });
  });

  test.afterAll(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  test("removes only the expired record's scope, leaving retained scopes, the shared configuration, and the saved conversation untouched", async () => {
    const home = path.join(machine, "home");
    // The shared Cursor configuration every scope was cloned from, with
    // its saved conversation under `chats`.
    const sharedConfigDir = path.join(machine, "shared-cursor-config");
    mkdirSync(path.join(sharedConfigDir, "chats"), { recursive: true });
    const sharedConfig = `${JSON.stringify({
      model: "auto",
      hasChangedDefaultModel: false,
      fixtureSetting: "from-shared-config",
    })}\n`;
    writeFileSync(path.join(sharedConfigDir, "cli-config.json"), sharedConfig);
    const savedConversation = path.join(
      sharedConfigDir,
      "chats",
      "saved-conversation.txt",
    );
    writeFileSync(savedConversation, "saved conversation\n");

    const scopesHome = path.join(
      home,
      ".open-dough",
      "dashboard",
      "cursor-session-scopes",
    );
    // One scope per seeded record, each cloned from the shared config
    // with its `chats` linked to the shared chats, as a launch leaves it.
    const makeScope = (name: string, model: string): string => {
      const scope = path.join(scopesHome, name);
      mkdirSync(scope, { recursive: true });
      writeFileSync(
        path.join(scope, "cli-config.json"),
        `${JSON.stringify({
          model,
          hasChangedDefaultModel: true,
          fixtureSetting: "from-shared-config",
        })}\n`,
      );
      symlinkSync(
        path.join(sharedConfigDir, "chats"),
        path.join(scope, "chats"),
        "dir",
      );
      return scope;
    };
    const expiredScope = makeScope("expired-scope", "gpt-5.2");
    const recentlyDoneScope = makeScope("recently-done-scope", "composer-2.5");
    const unclosedScope = makeScope("unclosed-scope", "auto");

    const scopedRecord = (
      sessionId: string,
      configScope: string,
      doneDaysAgo: number | undefined,
    ): object => {
      const seeded = openStoryRecord("cursor", sessionId) as {
        session: {
          continuation: { workspace: string; args: string[] };
        };
      };
      seeded.session.continuation = {
        workspace: "/tmp",
        args: ["cursor-agent", "--workspace", "/tmp", "--resume", sessionId],
        configScope,
      } as typeof seeded.session.continuation;
      return {
        ...seeded,
        ...(doneDaysAgo === undefined ? {} : { doneAt: daysAgo(doneDaysAgo) }),
      };
    };
    const expiredId = "a0000000-0000-4000-8000-000000000031";
    const recentlyDoneId = "a0000000-0000-4000-8000-000000000029";
    const unclosedId = "a0000000-0000-4000-8000-000000000040";
    seedStore(
      machine,
      JSON.stringify({
        "open-dough": [
          scopedRecord(expiredId, expiredScope, 31),
          scopedRecord(recentlyDoneId, recentlyDoneScope, 29),
          scopedRecord(unclosedId, unclosedScope, undefined),
        ],
      }),
    );
    expect(existsSync(expiredScope)).toBe(true);

    // An ordinary launch writes the record store; that write drops the
    // record marked done 31 days ago and no other.
    server.claudeScenario("launched");
    const launched = await launch(
      server,
      distinctStoryRequest("retention-scope-write"),
    );
    expect(launched.status).toBe(200);

    const storedIds = storedRecords(machine).map(
      (entry) =>
        (entry as { session: { sessionId: string } }).session.sessionId,
    );
    expect(storedIds).not.toContain(expiredId);
    expect(storedIds).toContain(recentlyDoneId);
    expect(storedIds).toContain(unclosedId);
    // Exactly the expired record's scope was retired, and not before its
    // record was gone; every retained record's scope stays.
    expect(existsSync(expiredScope)).toBe(false);
    expect(existsSync(recentlyDoneScope)).toBe(true);
    expect(existsSync(unclosedScope)).toBe(true);
    // Scope removal did not follow the `chats` symlink: the shared
    // configuration and saved conversation evidence are intact.
    expect(
      readFileSync(path.join(sharedConfigDir, "cli-config.json"), "utf8"),
    ).toBe(sharedConfig);
    expect(readFileSync(savedConversation, "utf8")).toBe(
      "saved conversation\n",
    );
  });
});
