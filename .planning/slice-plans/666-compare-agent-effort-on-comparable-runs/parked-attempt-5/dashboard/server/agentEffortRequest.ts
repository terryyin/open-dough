import { homedir } from "node:os";
import path from "node:path";
import { claudeUsageRoots, codexUsageRoots } from "./usageImport.ts";
import { agentEffortReport, type EffortEvidence } from "./agentEffortReport.ts";
import { cursorEffortReport } from "./agentEffortCursor.ts";

export type EffortRequest = {
  home?: string | undefined;
  store?: string | undefined;
  task?: string | undefined;
  family?: string | undefined;
  host?: string | undefined;
  from?: string | undefined;
  until?: string | undefined;
  list?: boolean | undefined;
  "guidance-version"?: string | undefined;
  "codex-file"?: string[] | undefined;
  "claude-file"?: string[] | undefined;
  "codex-root"?: string[] | undefined;
  "claude-root"?: string[] | undefined;
  "cursor-root"?: string[] | undefined;
};
export async function readEffortRequest(values: EffortRequest, observe?: (evidence: EffortEvidence) => void) {
  if (values.host && !["codex", "claude", "cursor"].includes(values.host))
    throw new Error("--host must be codex, claude or cursor");
  const home = path.resolve(values.home ?? homedir());
  if (values.host === "cursor") return cursorEffortReport({
    home, roots: values["cursor-root"], family: values.family, task: values.task,
    from: values.from, until: values.until, list: values.list, guidanceVersion: values["guidance-version"],
  });
  return agentEffortReport({
    home, ...(values.store ? { store: values.store } : {}), since: "1970-01-01T00:00:00.000Z",
    codexRoots: values["codex-root"] ?? (values["codex-file"] ? [] : codexUsageRoots(home)),
    claudeRoots: values["claude-root"] ?? (values["claude-file"] ? [] : claudeUsageRoots(home)),
    ...(values["codex-file"] ? { codexFiles: values["codex-file"] } : {}),
    ...(values["claude-file"] ? { claudeFiles: values["claude-file"] } : {}),
  }, {
    task: values.task, family: values.family, host: values.host as "codex" | "claude" | undefined,
    from: values.from, until: values.until, list: values.list, guidanceVersion: values["guidance-version"],
  }, observe);
}
export type EffortReport = Exclude<Awaited<ReturnType<typeof readEffortRequest>>, { selections: unknown }>;
