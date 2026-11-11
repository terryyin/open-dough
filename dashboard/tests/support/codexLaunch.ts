// Shared Codex native protocol fixture; it supplies vendor answers only.
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test as base } from "../dashboardTest.ts";
import { installFakeCodex, type FakeCodex } from "./fakeCodex.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
export { expect } from "../dashboardTest.ts";

// The fake Codex installed on the test's machine, for any test whose
// `machine` fixture supplies that directory.
export async function codexProtocol(
  { machine }: { machine: string | undefined },
  use: (native: FakeCodex) => Promise<void>,
) {
  const native = await installFakeCodex(
    machine ?? "",
    process.env["PATH"] ?? "",
    true,
  );
  await use(native);
  await native.close();
}

export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-codex's space-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  codexProtocol,
});
export const stored = (home: string): LaunchRecord[] =>
  (
    JSON.parse(
      readFileSync(
        path.join(home, ".open-dough", "dashboard", "agent-launches.json"),
        "utf8",
      ),
    ) as Record<string, LaunchRecord[]>
  )["open-dough"] ?? [];
export function codexSkill(home: string, flag?: string, label?: string) {
  const root = path.join(
    home,
    "git",
    "open-dough",
    ".agents",
    "skills",
    "dough-story-refinement",
  );
  mkdirSync(path.join(root, "references"), { recursive: true });
  writeFileSync(
    path.join(root, "SKILL.md"),
    "# The installed refinement skill\n",
  );
  if (flag !== undefined)
    writeFileSync(
      path.join(root, "references", "refinement-options.json"),
      JSON.stringify(
        makeMe.anOptionsDefinition
          .with({
            command: "dough-story-refinement",
            options: [
              makeMe.anOptionsEntry
                .with({
                  flag,
                  label: label ?? "Codex option",
                  summary:
                    label === undefined ? "Selected in Codex." : `${label}.`,
                  instruction: "Investigate.",
                })
                .please(),
            ],
          })
          .please(),
      ),
    );
  return root;
}
