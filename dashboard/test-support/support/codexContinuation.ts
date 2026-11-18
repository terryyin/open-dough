// Saved continuation and native outcomes in the existing mixed-host launch journey.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { CodexSession } from "../../src/agentLaunch.ts";
import { shellCommand } from "../../src/sessionCapabilities.ts";
import { expect, stored } from "./codexLaunch.ts";
import type { FakeCodex } from "./fakeCodex.ts";

export function expectSavedContinuation(
  session: CodexSession,
  home: string,
  native: FakeCodex,
) {
  const continuation = session.continuation;
  if (continuation === undefined) throw new Error("Missing continuation.");
  const args = [
    "codex",
    "resume",
    "--remote",
    `unix://${native.env["FAKE_CODEX_SOCKET"] ?? ""}`,
    "--cd",
    path.join(home, "git", "open-dough"),
    native.threadId,
  ];
  expect(continuation.args).toEqual(args);
  expect(continuation.workspace).toBe(path.join(home, "git", "open-dough"));
  expect(continuation.notice).toBeUndefined();
  return { continuation, args };
}

export function expectResumeCommand(
  shownCommand: string,
  args: readonly string[],
  native: FakeCodex,
) {
  expect(shownCommand).toBe(shellCommand(args));
  execFileSync("/bin/sh", ["-c", shownCommand], {
    env: { ...process.env, ...native.env },
    stdio: "pipe",
  });
  expect(
    JSON.parse(
      readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8")
        .trim()
        .split("\n")
        .at(-1) ?? "",
    ),
  ).toEqual(args.slice(1));
}

export async function disconnectContinuation(
  session: CodexSession,
  home: string,
  native: FakeCodex,
) {
  // Supply only a native disconnection; the real adapter records its notice.
  native.failConnection();
  const notice =
    "The dashboard's native connection ended. Current activity is unavailable; continue the recorded conversation in Codex.";
  await expect
    .poll(() => {
      const saved = stored(home).find(
        (entry) => entry.session.host === "codex",
      )?.session;
      return saved?.host === "codex" ? saved.continuation?.notice : undefined;
    })
    .toBe(notice);
  const records = stored(home);
  expect(
    records.find((entry) => entry.session.host === "codex")?.session,
  ).toEqual({
    ...session,
    continuation: { ...session.continuation, notice },
  });
  return { notice, records };
}
