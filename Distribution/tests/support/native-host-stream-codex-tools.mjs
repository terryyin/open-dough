// Literal Codex tool/receipt decoding. Recorded JavaScript is data, never run.
const names = new Map([
  ["exec_command", "command"],
  ["write_stdin", "wait"],
  ["clock__curr_time", "clock"],
]);
const literal = (source) =>
  JSON.parse(
    source.replace(
      /("(?:\\.|[^"\\])*")|([A-Za-z_$][\w$]*)(?=\s*:)/g,
      (whole, quoted, key) => (quoted ? whole : JSON.stringify(key)),
    ),
  );
export function toolInvocations(call) {
  const direct = names.get(call.name?.replace(/^functions\./, ""));
  if (direct) {
    try {
      return [{ kind: direct, args: JSON.parse(call.arguments) }];
    } catch {
      return null;
    }
  }
  if (call.name !== "exec" || typeof call.input !== "string") return null;
  const source = call.input.replace(/^\s*\/\/ @exec:[^\n]*\n/, "");
  const statement =
    /\s*text\(\s*await\s+tools\.(exec_command|write_stdin|clock__curr_time)\(\s*(\{(?:[^"{}]|"(?:\\.|[^"\\])*")*\})\s*\)\s*\)\s*;?/y;
  const found = [];
  let position = 0;
  while (position < source.trimEnd().length) {
    statement.lastIndex = position;
    const match = statement.exec(source);
    if (!match) return null;
    try {
      found.push({ kind: names.get(match[1]), args: literal(match[2]) });
    } catch {
      return null;
    }
    position = statement.lastIndex;
  }
  return found;
}

// Only host envelope text is decoded. A receipt's stdout is never recursed.
export function toolReceipts(output) {
  if (typeof output === "string") {
    try {
      return toolReceipts(JSON.parse(output));
    } catch {
      return [];
    }
  }
  if (Array.isArray(output)) return output.flatMap(toolReceipts);
  if (!output || typeof output !== "object") return [];
  if (
    Object.hasOwn(output, "exit_code") ||
    Object.hasOwn(output, "session_id") ||
    Object.hasOwn(output, "current_time")
  )
    return [output];
  if (["input_text", "text"].includes(output.type))
    return toolReceipts(output.text);
  return Array.isArray(output.content) ? toolReceipts(output.content) : [];
}

// An authentic handle originates in an owned launch receipt and remains live
// only until a terminal/mismatched receipt. Copied history cannot lend handles.
export function codexWaitFacts(tools, usage, thread) {
  const handles = new Map(),
    waits = [];
  const owned = (tool) =>
    tool.thread === thread &&
    tool.receiptThread === thread &&
    tool.turn &&
    tool.turn === tool.receiptTurn &&
    typeof tool.callId === "string" &&
    typeof tool.receiptId === "string" &&
    typeof tool.responseId === "string" &&
    usage.some(
      (u) =>
        u.thread === thread &&
        u.turn === tool.turn &&
        u.responseId === tool.responseId,
    );
  for (const tool of tools) {
    const r = tool.receipt,
      id = tool.args.session_id;
    if (!owned(tool)) continue;
    if (
      tool.kind === "command" &&
      r &&
      Number.isSafeInteger(r.session_id) &&
      !Object.hasOwn(r, "exit_code") &&
      typeof r.output === "string" &&
      typeof tool.args.cmd === "string"
    ) {
      // Reused native ids are ambiguous, even if a previous process ended.
      if (handles.has(r.session_id)) handles.set(r.session_id, null);
      else
        handles.set(r.session_id, {
          ...tool,
          sessionId: r.session_id,
          live: true,
        });
    }
    if (tool.kind !== "wait") continue;
    const launch = handles.get(id);
    const valid =
      launch?.live &&
      launch.turn === tool.turn &&
      tool.order > launch.receiptOrder &&
      r &&
      typeof r.output === "string" &&
      (r.session_id === id || (Number.isInteger(r.exit_code) && !r.session_id));
    const nonterminal =
      valid && r.session_id === id && !Object.hasOwn(r, "exit_code");
    const empty =
      nonterminal &&
      (tool.args.chars ?? "") === "" &&
      r.output === "" &&
      r.original_token_count === 0;
    const next = usage.find(
      (u) =>
        u.thread === thread &&
        u.turn === tool.turn &&
        u.order > tool.receiptOrder &&
        u.responseId &&
        u.responseId !== tool.responseId,
    );
    waits.push({
      callId: tool.callId,
      receiptId: tool.receiptId,
      turn: tool.turn,
      responseId: tool.responseId,
      sessionId: id,
      order: tool.order,
      receiptOrder: tool.receiptOrder,
      at: tool.at,
      receiptAt: tool.receiptAt,
      launchCallId: launch?.callId ?? null,
      launchAt: launch?.receiptAt ?? null,
      command: launch?.args.cmd ?? null,
      status: valid ? (nonterminal ? "live" : "terminal") : "unknown",
      empty:
        valid && (r.output !== "" || r.original_token_count === 0)
          ? Boolean(empty)
          : null,
      nextResponseId: next?.responseId ?? null,
      nextResponseOrder: next?.order ?? null,
      nextResponseAt: next?.at ?? null,
    });
    if (launch && (!valid || !nonterminal)) {
      launch.live = false;
      launch.endedAt = tool.receiptAt;
    }
  }
  return {
    waits,
    handles: [...handles.values()].filter(Boolean).map((h) => ({
      sessionId: h.sessionId,
      command: h.args.cmd,
      callId: h.callId,
      receiptId: h.receiptId,
      turn: h.turn,
      responseId: h.responseId,
      at: h.at,
      receiptAt: h.receiptAt,
      endedAt: h.endedAt ?? null,
      order: h.order,
      receiptOrder: h.receiptOrder,
    })),
  };
}
