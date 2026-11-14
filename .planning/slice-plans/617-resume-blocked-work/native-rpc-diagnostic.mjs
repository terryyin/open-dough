// Completes the one Unix-WebSocket diagnostic on the existing held thread.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync, existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { createConnection } from "node:net";
import { once } from "node:events";
import WebSocket from "ws";

const root = process.argv[2];
const project = join(root, "project");
const prior = JSON.parse(readFileSync(join(root, "result.json")));
const { threadId } = prior;
const before = JSON.parse(readFileSync(join(root, "held-native.json")));
const initialTurnIds = before.history.thread.turns.map((turn) => turn.id);
const input = JSON.parse(readFileSync(join(root, "continuation-input.json")));
const save = (name, value) => writeFileSync(join(root, name), `${JSON.stringify(value, null, 2)}\n`);
const log = (event) => { appendFileSync(join(root, "controller.jsonl"), `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`); console.log(JSON.stringify(event)); };
if (!existsSync(join(root, "cli-refusal-result.json"))) save("cli-refusal-result.json", prior);
const daemon = JSON.parse(execFileSync("codex", ["app-server", "daemon", "version"], { encoding: "utf8" }));
const socket = new WebSocket("ws://localhost/", { createConnection: () => createConnection({ path: daemon.socketPath }) });
const requests = new Map();
let next = 0;
let acceptedTurn;
let submitted = false;
let resolveTerminal;
let rejectTerminal;
const completed = new Map();
const terminal = new Promise((resolve, reject) => { resolveTerminal = resolve; rejectTerminal = reject; });
const request = (method, params) => new Promise((resolve, reject) => {
  const id = ++next;
  requests.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const settings = (value) => Object.fromEntries(Object.keys(JSON.parse(readFileSync(join(root, "held-settings.json")))).map((key) => [key, value[key]]));
socket.on("message", (data) => {
  const message = JSON.parse(data.toString("utf8"));
  if (message.id !== undefined) {
    const pending = requests.get(message.id);
    requests.delete(message.id);
    if (message.error) pending?.reject(new Error(JSON.stringify(message.error)));
    else pending?.resolve(message.result);
  }
  if (message.params?.threadId === threadId && message.method) {
    appendFileSync(join(root, "resumed-rpc-events.jsonl"), `${JSON.stringify(message)}\n`);
    if (message.method === "turn/completed") {
      completed.set(message.params.turn.id, message.params.turn);
      if (message.params.turn.id === acceptedTurn) resolveTerminal(message.params.turn);
    }
  }
});
socket.on("close", () => {
  for (const pending of requests.values()) pending.reject(new Error("Native connection closed"));
  if (submitted && !completed.has(acceptedTurn)) rejectTerminal(new Error("Native continuation observation ended"));
});
try {
  await once(socket, "open");
  await request("initialize", { clientInfo: { name: "open_dough_blocked_probe", version: "1" }, capabilities: { experimentalApi: true } });
  socket.send('{"method":"initialized"}');
  const reconciled = await request("thread/read", { threadId, includeTurns: true });
  save("pre-rpc-reconciliation.json", reconciled);
  if (reconciled.thread.id !== threadId || realpathSync(reconciled.thread.cwd) !== realpathSync(project) || JSON.stringify(reconciled.thread.turns.map((turn) => turn.id)) !== JSON.stringify(initialTurnIds)) throw new Error("CLI refusal did not reconcile to the single held turn");
  const resumed = await request("thread/resume", { threadId });
  if (JSON.stringify(settings(resumed)) !== JSON.stringify(settings(before.resumed))) throw new Error("Held native settings no longer match");
  log({ type: "refusal-reconciled", threadId, turnIds: initialTurnIds, continuationAccepted: false });
  const evidence = JSON.parse(readFileSync(join(project, "supplier-evidence.json")));
  if (evidence.status !== "ready" || evidence.checked !== true) throw new Error("Supplier evidence no longer qualifies");
  log({ type: "rpc-continuation-submission", threadId, endpoint: `unix://${daemon.socketPath}`, input: input.text });
  submitted = true;
  const receipt = await request("turn/start", { threadId, input: [{ type: "text", text: input.text }] });
  acceptedTurn = receipt.turn.id;
  save("native-acceptance.json", receipt);
  log({ type: "native-turn-accepted", threadId, turnId: acceptedTurn, settings: settings(resumed) });
  if (completed.has(acceptedTurn)) resolveTerminal(completed.get(acceptedTurn));
  const result = await terminal;
  log({ type: "native-turn-terminal", threadId, turnId: acceptedTurn, status: result.status });
  const history = await request("thread/read", { threadId, includeTurns: true });
  const after = await request("thread/resume", { threadId });
  save("resumed-native.json", { resumed: after, history });
  save("resumed-settings.json", settings(after));
  if (result.status !== "completed" || history.thread.turns.length !== initialTurnIds.length + 1) throw new Error("Continuation did not complete exactly once");
  if (JSON.stringify(settings(after)) !== JSON.stringify(settings(resumed))) throw new Error("Native continuation changed settings");
  if (!existsSync(join(project, "final-report.json"))) throw new Error("The native continuation produced no report");
  const report = JSON.parse(readFileSync(join(project, "final-report.json")));
  if (report.subtotal !== 125 || report.total !== 135 || report.currency !== "SGD") throw new Error("The completed native report does not fulfill the invoice task");
  const replay = await request("thread/read", { threadId, includeTurns: true });
  const replayEvidence = JSON.parse(readFileSync(join(project, "supplier-evidence.json")));
  const handled = replay.thread.turns.some((turn) => turn.id === acceptedTurn);
  log({ type: "replayed-signal", evidence: replayEvidence, handled, additionalSubmissions: 0, turnIds: replay.thread.turns.map((turn) => turn.id) });
  const assessment = { result: "pass", root, project, threadId, heldTurn: initialTurnIds[0], acceptedTurn, terminalStatus: result.status, acceptedContinuationCount: 1, nativeCliRefusals: 1, rpcContinuationSubmissions: 1, idleModelSubmissions: 0, developerTypedResume: false, settings: settings(after), report };
  save("result.json", assessment);
  log({ type: "probe-complete", ...assessment });
} catch (error) {
  save("result.json", { result: "incomplete", root, project, threadId, acceptedTurn, submitted, error: String(error) });
  log({ type: "probe-incomplete", root, threadId, acceptedTurn, submitted, error: String(error) });
  process.exitCode = 1;
} finally {
  const closed = once(socket, "close"); socket.close(); await closed;
}
