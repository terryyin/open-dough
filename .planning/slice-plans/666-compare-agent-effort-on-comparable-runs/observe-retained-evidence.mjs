// Preparation evidence only. Read retained samples; print aggregates, no bodies.
import { globSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { codexUsage } from "../../../dashboard/server/codexUsage.ts";
import { codexLineage } from "../../../dashboard/server/codexUsageLineage.ts";
import { claudeUsage } from "../../../dashboard/server/claudeUsage.ts";
import { claudeLineage } from "../../../dashboard/server/claudeUsageLineage.ts";
import { collectResponses } from "../../../dashboard/server/usageReconciliation.ts";

const home = homedir();
const root = "01a1d22f-e0cd-7032-930d-5a9ff3011a64";
// SQLite discovers candidates only; the native reader checks owning thread IDs.
const discovered = spawnSync("python3", ["-c", `
import sqlite3,pathlib,json
c=sqlite3.connect('file:'+str(pathlib.Path.home()/'.codex/state_5.sqlite')+'?mode=ro',uri=True)
rows=list(c.execute('select id,source,rollout_path from threads'))
family={'${root}'}
while True:
 before=len(family)
 for ident,source,path in rows:
  try: parent=json.loads(source).get('subagent',{}).get('thread_spawn',{}).get('parent_thread_id')
  except (ValueError,AttributeError): continue
  if parent in family: family.add(ident)
 if len(family)==before: break
print(json.dumps([path for ident,source,path in rows if ident in family]))
`], { encoding: "utf8" });
if (discovered.status !== 0) throw new Error(discovered.stderr);
const files = JSON.parse(discovered.stdout);
const codex = new Map(), codexGaps = [], lineage = codexLineage();
for (const file of files)
  await collectResponses(codexUsage(file, Date.parse("2026-11-12T00:03:56Z"), codexGaps, lineage), codex);
const rows = [...codex.values()].filter((r) => Date.parse(r.at) < Date.parse("2026-11-14T00:03:56Z"));
const sum = (name) => rows.reduce((n, r) => n + (r.tokens[name] ?? 0), 0);
console.log(JSON.stringify({ sample: "codex-audit-window", files: files.length,
  nativeDescendants: [...lineage.sessions.values()].filter((s) => s.parents.length).length,
  requests: rows.length, input: sum("uncachedInput") + sum("cacheRead"),
  cached: sum("cacheRead"), output: sum("output"),
  total: sum("uncachedInput") + sum("cacheRead") + sum("output"), gaps: codexGaps }));

const claudeId = "296b888d-08b1-4b06-ac2e-24a4462da7d0";
const claude = new Map(), claudeGaps = [];
for (const file of globSync(`${home}/.claude/projects/*/${claudeId}.jsonl`))
  await collectResponses(claudeUsage(file, 0, claudeGaps, claudeLineage()), claude);
const settings = new Map();
let peak = null;
for (const row of claude.values()) {
  const counts = [row.tokens.uncachedInput, row.tokens.cacheRead, row.tokens.cacheWrite];
  if (counts.every((v) => v !== null)) peak = Math.max(peak ?? 0, counts.reduce((a, b) => a + b, 0));
  const key = JSON.stringify(row.settings);
  settings.set(key, (settings.get(key) ?? 0) + 1);
}
console.log(JSON.stringify({ sample: "claude-coordinator", responses: claude.size, peak,
  settings: [...settings], gaps: claudeGaps }));

const cursorId = "a6169ce7-5db3-4970-8f00-c8bf8c548fb4";
const cursorFiles = globSync(`${home}/.cursor/projects/*/agent-transcripts/${cursorId}/${cursorId}.jsonl`);
let todo = 0, planReads = 0, usageRows = 0;
for (const file of cursorFiles) {
  for (const line of readFileSync(file, "utf8").trim().split("\n")) {
    const row = JSON.parse(line), message = row.message ?? {};
    if (message.usage || Object.keys(row).some((k) => /usage|token/i.test(k))) usageRows++;
    for (const part of Array.isArray(message.content) ? message.content : []) {
      if (part.type !== "tool_use") continue;
      const input = part.input ?? {};
      const name = part.name === "CallDynamicTool" ? (input.toolName ?? input.name ?? input.tool) : part.name;
      if (name === "TodoWrite") todo++;
      if (name === "Read" && JSON.stringify(input).includes("PLAN.md")) planReads++;
    }
  }
}
console.log(JSON.stringify({ sample: "cursor-coordinator", files: cursorFiles.length, todo, planReads, usageRows }));
