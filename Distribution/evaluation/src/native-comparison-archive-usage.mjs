// Account-free response measurements, attributed to this coordinator and its
// owned workers. Missing or incomplete measurements remain unknown.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readCodexSession } from "./native-host-stream.mjs";
import { identity } from "./native-comparison-archive-evidence.mjs";

// Deduplicate own native responses, never sum replayed fork history or CLI
// cumulative prefixes. Unknown or unattributed rows make completeness unknown.
export function retainedUsage(attempt, thread, expectedWorkers = 0) {
  const files = readdirSync(attempt).filter((name) =>
    /^codex-(session|worker-.+)\.jsonl$/.test(name),
  );
  const responses = new Map();
  let complete = files.includes("codex-session.jsonl"),
    workers = 0;
  const parentFile = join(attempt, "codex-session.jsonl");
  const rootTurns = existsSync(parentFile)
    ? readCodexSession(parentFile).startedTurns
    : [];
  const parents = new Map(
    files.map((name) => {
      const session = readCodexSession(join(attempt, name));
      return [session.thread, session.parentThread];
    }),
  );
  for (const name of files) {
    const lifecycle = readCodexSession(join(attempt, name));
    const owner = lifecycle.thread;
    if (name !== "codex-session.jsonl") workers++;
    let ancestor = owner;
    const seen = new Set();
    while (ancestor && ancestor !== thread && !seen.has(ancestor)) {
      seen.add(ancestor);
      ancestor = parents.get(ancestor);
    }
    if (ancestor !== thread) complete = false;
    const own = lifecycle.usage.filter((row) => row.thread === owner);
    if (!owner || !own.length) complete = false;
    if (
      !lifecycle.startedTurns.length ||
      lifecycle.startedTurns.some(
        (turn) =>
          !lifecycle.completedTurns.includes(turn) ||
          !own.some((row) => row.turn === turn),
      )
    )
      complete = false;
    for (const p of own) {
      if (!p.responseId || !p.turn || !p.rootTurn) {
        complete = false;
        continue;
      }
      if (
        !rootTurns.includes(p.rootTurn) ||
        !lifecycle.completedTurns.includes(p.turn)
      )
        complete = false;
      const counts = p.counts;
      if (Object.values(counts).includes(null)) complete = false;
      const fact = {
        thread: identity(owner),
        parent: identity(lifecycle.parentThread),
        response: identity(p.responseId),
        turn: identity(p.turn),
        rootTurn: identity(p.rootTurn),
        usage: counts,
      };
      const key = `${owner}:${p.responseId}`;
      if (
        responses.has(key) &&
        JSON.stringify(responses.get(key)) !== JSON.stringify(fact)
      )
        complete = false;
      responses.set(key, fact);
    }
    // The reader also validates all paired native receipts; malformed records
    // cannot become a known zero-worker or zero-token observation.
  }
  const rows = [...responses.values()];
  if (workers !== expectedWorkers) complete = false;
  return {
    status: complete ? "complete" : "unknown",
    coordinator: identity(thread),
    workers: files.includes("codex-session.jsonl") ? expectedWorkers : null,
    responses: rows,
    totals: complete
      ? Object.fromEntries(
          [
            "input_tokens",
            "cached_input_tokens",
            "output_tokens",
            "total_tokens",
          ].map((key) => [key, rows.reduce((n, row) => n + row.usage[key], 0)]),
        )
      : null,
  };
}
