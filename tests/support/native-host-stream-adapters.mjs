// One adapter per native host (Claude, Codex, and Cursor stream JSON): the
// only place their event shapes live. The shared reader (native-host-stream.mjs)
// parses each stream line and hands the event to its host's adapter.
//
// Each adapter folds one parsed event into `session`: a started command opens
// an entry by its host id, a completion attaches output (and opens the entry
// when its start was never seen), other tool calls open and finish their own
// entries the same way, and the terminal event sets `complete`. `readPath`
// names the file a tool call reads, and `inspects` whether its input counts
// among the inspection targets.
export const adapters = {
  claude: {
    read(event, session) {
      if (event.type === "assistant") {
        for (const part of contentParts(event.message)) {
          if (part.type === "tool_use" && part.name === "Bash") {
            session.start(part.id, part.input?.command);
          } else if (part.type === "tool_use") {
            session.tool(part.id, part.name, part.input);
          } else if (part.type === "text") {
            session.message(part.text);
          }
        }
      } else if (event.type === "user") {
        for (const part of contentParts(event.message)) {
          if (part.type === "tool_result") {
            session.finish(part.tool_use_id, undefined, resultText(part));
          }
        }
      } else if (event.type === "result") {
        session.respond(event.result);
        session.end();
      }
    },
    partial: (event) => "message" in event || "type" in event,
    readPath: (tool) => (tool.name === "Read" ? tool.input?.file_path : null),
    inspects: (tool) => ["Read", "Glob", "Grep"].includes(tool.name),
  },
  codex: {
    read(event, session) {
      const item = event.item;
      if (event.type === "item.started" && item?.type === "command_execution") {
        session.start(item.id, item.command);
      } else if (event.type === "item.completed") {
        if (item?.type === "command_execution") {
          session.finish(
            item.id,
            item.command,
            item.aggregated_output ?? "",
            item.exit_code,
          );
        } else if (item?.type === "agent_message") {
          session.message(item.text);
          session.respond(item.text);
        }
      } else if (event.type === "turn.completed") {
        session.end();
      }
    },
    partial: (event) => "type" in event,
    readPath: () => null,
    inspects: () => false,
  },
  cursor: {
    read(event, session) {
      if (event.type === "tool_call") {
        const [name, call] = cursorToolCall(event.tool_call);
        if (!call) {
          return;
        }
        if (name !== "shellToolCall") {
          session.tool(event.call_id, name, call.args);
          if (event.subtype === "completed") {
            session.finish(event.call_id, undefined, cursorToolOutput(call));
          }
        } else if (event.subtype === "started") {
          session.start(event.call_id, call.args?.command);
        } else if (event.subtype === "completed") {
          const outcome = call.result?.success ?? call.result?.failure;
          session.finish(
            event.call_id,
            call.args?.command,
            cursorShellOutput(call.result),
            outcome?.exitCode,
          );
        }
      } else if (event.type === "assistant") {
        for (const part of contentParts(event.message)) {
          if (part.type === "text") {
            session.message(part.text);
          }
        }
      } else if (event.type === "result") {
        session.respond(event.result);
        session.end();
      }
    },
    partial: (event) => "tool_call" in event || "type" in event,
    readPath: (tool) =>
      tool.name === "readToolCall" ? tool.input?.path : null,
    inspects: () => true,
  },
};

function contentParts(message) {
  return Array.isArray(message?.content) ? message.content : [];
}

function resultText(part) {
  if (typeof part.content === "string") {
    return part.content;
  }
  if (Array.isArray(part.content)) {
    return part.content
      .map((piece) =>
        typeof piece?.text === "string" ? piece.text : JSON.stringify(piece),
      )
      .join("\n");
  }
  return part.content === undefined ? "" : JSON.stringify(part.content);
}

// The one `...ToolCall` entry of a Cursor `tool_call`, as [name, call].
function cursorToolCall(toolCall) {
  for (const [name, call] of Object.entries(toolCall ?? {})) {
    if (name.endsWith("ToolCall") && call && typeof call === "object") {
      return [name, call];
    }
  }
  return [null, null];
}

function cursorToolOutput(call) {
  const content = call.result?.success?.content;
  if (typeof content === "string") {
    return content;
  }
  return call.result === undefined ? "" : JSON.stringify(call.result);
}

function cursorShellOutput(result) {
  const outcome = result?.success ?? result?.failure;
  if (outcome) {
    return [outcome.stdout, outcome.stderr]
      .filter((text) => typeof text === "string" && text !== "")
      .join("\n");
  }
  return result === undefined ? "" : JSON.stringify(result);
}
