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
import { test as base } from "../dashboardTest.ts";
import { installFakeCodex } from "./fakeCodex.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
export { expect } from "../dashboardTest.ts";

export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-codex's space-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  codexProtocol: async ({ machine }, use) => {
    const native = await installFakeCodex(
      machine ?? "",
      process.env["PATH"] ?? "",
      true,
    );
    await use(native);
    await native.close();
  },
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
export function codexSkill(home: string, flag?: string) {
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
      JSON.stringify({
        command: "dough-story-refinement",
        options: [
          {
            flag,
            label: "Codex option",
            summary: "Selected in Codex.",
            instruction: "Investigate.",
          },
        ],
      }),
    );
  return root;
}
