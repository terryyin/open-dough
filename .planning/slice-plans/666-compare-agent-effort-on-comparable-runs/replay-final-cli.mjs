// Retained aggregate proof only; invokes the real CLI, never writes native data.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const home = mkdtempSync(path.join(tmpdir(), "effort-audits-"));
const command = "dashboard/server/compareAgentEffort.ts";
const family = "01a1d22f-e0cd-7032-930d-5a9ff3011a64";
const files = JSON.parse(execFileSync("python3", ["-c", `
import sqlite3,pathlib,json
c=sqlite3.connect('file:'+str(pathlib.Path.home()/'.codex/state_5.sqlite')+'?mode=ro',uri=True)
rows=list(c.execute('select id,source,rollout_path from threads'))
family={'${family}'}
while True:
 before=len(family)
 for ident,source,path in rows:
  try: parent=json.loads(source).get('subagent',{}).get('thread_spawn',{}).get('parent_thread_id')
  except (ValueError,AttributeError): continue
  if parent in family: family.add(ident)
 if len(family)==before: break
print(json.dumps([path for ident,source,path in rows if ident in family]))
`], { encoding: "utf8" }));
const results = [];
function run(label, args) {
  const actual = JSON.parse(execFileSync(process.execPath, [command, "--home", home, "--json", ...args], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }));
  results.push({ label, command: ["node", command, "--home", "ISOLATED-EMPTY-HOME", "--json", ...args], selection: actual.selection, threads: actual.threads, totals: actual.totals, agents: actual.agents.map(({ id, role, peakInput, observedSettings, workflow }) => ({ id, role, peakInput, observedSettings, workflow })), workflow: actual.workflow, gaps: actual.gaps });
}
try {
  const codex = ["--host", "codex", "--family", family, ...files.flatMap((file) => ["--codex-file", file]), "--claude-root", path.join(home, "empty-claude")];
  run("codex-original-audit-window", [...codex, "--from", "2026-11-12T00:03:56Z", "--until", "2026-11-14T00:03:56Z"]);
  run("codex-whole-retained-family-across-tasks", [...codex, "--from", "1970-01-01T00:00:00Z", "--until", "2999-01-01T00:00:00Z"]);
  run("claude-retained-coordinator", ["--host", "claude", "--family", "296b888d-08b1-4b06-ac2e-24a4462da7d0", "--from", "1970-01-01T00:00:00Z", "--until", "2999-01-01T00:00:00Z", "--codex-root", path.join(home, "empty-codex"), "--claude-file", "/Users/terryyin/.claude/projects/-Users-terryyin-git-open-dough--worktrees-make-landed-ci-repeat-checks-pass-under-moderate/296b888d-08b1-4b06-ac2e-24a4462da7d0.jsonl"]);
  run("cursor-whole-retained-directory-family", ["--host", "cursor", "--family", "a6169ce7-5db3-4970-8f00-c8bf8c548fb4", "--cursor-root", "/Users/terryyin/.cursor/projects/Users-terryyin-git-open-dough-worktrees-speed-up-cursor-session-checks/agent-transcripts"]);
  assert.equal(results[0].threads, 11);
  assert.equal(results[0].totals.requests.value, 2083);
  assert.equal(results[0].totals.totalTokens.value, 436806678);
  assert.ok(results[1].totals.requests.value > results[0].totals.requests.value);
  assert.equal(results[2].agents.find((agent) => agent.role === "coordinator").peakInput.value, 752562);
  assert.equal(results[3].agents.find((agent) => agent.role === "coordinator").workflow.todoWriteCalls, 15);
  assert.equal(results[3].agents.find((agent) => agent.role === "coordinator").workflow.planReads, 8);
  for (const result of results) {
    const coordinator = result.agents.find((agent) => agent.role === "coordinator");
    const { agents, totals, ...summary } = result;
    const proof = { ...summary, totals: Object.fromEntries(["requests", "totalInput", "cachedInput", "output", "totalTokens"].map((key) => [key, totals[key]])), coordinator: coordinator ? { peakInput: coordinator.peakInput, observedSettings: coordinator.observedSettings, workflow: coordinator.workflow } : null };
    writeFileSync(new URL(`slice-5-${result.label}.json`, import.meta.url), JSON.stringify(proof, null, 2) + "\n");
  }
  console.log(JSON.stringify(results.map(({ label, threads, totals, agents, workflow }) => ({ label, threads, requests: totals.requests.value, totalInput: totals.totalInput.value, totalTokens: totals.totalTokens.value, peak: agents.find((agent) => agent.role === "coordinator")?.peakInput.value, workflow }))));
} finally { rmSync(home, { recursive: true, force: true }); }
