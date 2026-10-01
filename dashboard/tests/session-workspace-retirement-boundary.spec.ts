// Real filesystem facts: absence, non-directory, and lookup errors stay distinct.
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { savedWorkspaceState } from "../server/sessionWorkspace.ts";
import type { HostSession } from "../src/agentLaunch.ts";

test("saved directory observation distinguishes absent path from ELOOP without changing workspace or conversation", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-workspace-boundary-"));
  const workspace = path.join(root, "saved-workspace");
  const session: HostSession = {
    host: "codex",
    sessionId: "retained",
    name: "Retained",
    continuation: { workspace, endpoint: "unix:///unused", args: [] },
  };
  const identity = structuredClone(session);
  try {
    expect(await savedWorkspaceState(session)).toEqual({ kind: "missing" });
    mkdirSync(workspace);
    expect(await savedWorkspaceState(session)).toEqual({ kind: "available" });
    rmSync(workspace, { recursive: true });
    writeFileSync(workspace, "not a directory");
    expect(await savedWorkspaceState(session)).toEqual({ kind: "missing" });
    rmSync(workspace);
    symlinkSync(workspace, workspace);
    expect(await savedWorkspaceState(session)).toEqual({ kind: "unknown" });
    expect(session).toEqual(identity);
    expect(
      await savedWorkspaceState({ ...session, continuation: undefined }),
    ).toEqual({ kind: "unknown" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
