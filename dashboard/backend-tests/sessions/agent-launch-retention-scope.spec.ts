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
import { expect, test } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { identity, launch, title } from "../../tests/agentLaunchBoundary.ts";
import { daysAgo, machineHome } from "../../tests/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  keptLaunchRecords,
} from "../../tests/support/launchStore.ts";
import { distinctStoryRequest } from "../../tests/openStorySessionSetup.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";

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
    const sharedConfig = `${JSON.stringify(makeMe.aCursorCliConfig.please())}\n`;
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
        `${JSON.stringify(makeMe.aCursorCliConfig.withModel(model).please())}\n`,
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

    // A Cursor execution launched 60 days ago in a session with this
    // configuration scope.
    const scopedRecord = (sessionId: string, configScope: string) =>
      makeMe.aLaunchRecord
        .executing({ identity, title })
        .inCursorSession({
          sessionId,
          continuation: { workspace: "/tmp", configScope },
        })
        .launchedAt(daysAgo(60));
    const expiredId = "a0000000-0000-4000-8000-000000000031";
    const recentlyDoneId = "a0000000-0000-4000-8000-000000000029";
    const unclosedId = "a0000000-0000-4000-8000-000000000040";
    keepLaunchStore(machineHome(machine), {
      "open-dough": [
        scopedRecord(expiredId, expiredScope)
          .markedDoneAt(daysAgo(31))
          .please(),
        scopedRecord(recentlyDoneId, recentlyDoneScope)
          .markedDoneAt(daysAgo(29))
          .please(),
        scopedRecord(unclosedId, unclosedScope).please(),
      ],
    });
    expect(existsSync(expiredScope)).toBe(true);

    // An ordinary launch writes the record store; that write drops the
    // record marked done 31 days ago and no other.
    server.claudeScenario("launched");
    const launched = await launch(
      server,
      distinctStoryRequest("retention-scope-write"),
    );
    expect(launched.status).toBe(200);

    const storedIds = keptLaunchRecords(machineHome(machine)).map((entry) => {
      if (!("session" in entry)) throw new Error("Expected a kept session");
      return entry.session.sessionId;
    });
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
