// The one reader of native host output streams (Claude, Codex, and Cursor
// stream JSON, plain or gzipped). Host event shapes live only here, in one
// adapter per host; callers get the started shell commands, their outputs,
// the final response, and the stream status. Shell callers use the CLI:
//
//   node tests/support/native-host-stream.mjs <host> <stream> <view>
//
// where <view> is `status`, `response`, `commands` (one JSON string per
// started command), `segments` (each command split at its separators, one per
// line), or `outputs` (each completed command's output).
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

// Each adapter folds one parsed event into `session`: a started command opens
// an entry by its host id, a completion attaches output (and opens the entry
// when its start was never seen), and the terminal event sets `complete`.
const adapters = {
  claude: {
    read(event, session) {
      if (event.type === "assistant") {
        for (const part of contentParts(event.message)) {
          if (part.type === "tool_use" && part.name === "Bash") {
            session.start(part.id, part.input?.command);
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
  },
  codex: {
    read(event, session) {
      const item = event.item;
      if (event.type === "item.started" && item?.type === "command_execution") {
        session.start(item.id, item.command);
      } else if (event.type === "item.completed") {
        if (item?.type === "command_execution") {
          session.finish(item.id, item.command, item.aggregated_output ?? "");
        } else if (item?.type === "agent_message") {
          session.respond(item.text);
        }
      } else if (event.type === "turn.completed") {
        session.end();
      }
    },
    partial: (event) => "type" in event,
  },
  cursor: {
    read(event, session) {
      if (event.type === "tool_call") {
        const shell = event.tool_call?.shellToolCall;
        if (!shell) {
          return;
        }
        if (event.subtype === "started") {
          session.start(event.call_id, shell.args?.command);
        } else if (event.subtype === "completed") {
          session.finish(
            event.call_id,
            shell.args?.command,
            cursorShellOutput(shell.result),
          );
        }
      } else if (event.type === "result") {
        session.respond(event.result);
        session.end();
      }
    },
    partial: (event) => "tool_call" in event || "type" in event,
  },
};

export const hosts = Object.keys(adapters);

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

function cursorShellOutput(result) {
  const outcome = result?.success ?? result?.failure;
  if (outcome) {
    return [outcome.stdout, outcome.stderr]
      .filter((text) => typeof text === "string" && text !== "")
      .join("\n");
  }
  return result === undefined ? "" : JSON.stringify(result);
}

// Joins a command's line continuations, as a shell reads them.
function joinContinuations(command) {
  return command.replace(/\\\n[ \t]*/g, " ");
}

// The simple commands `command` runs, split at `&&`, `||`, `;`, `|`, and
// newlines, trimmed, without empty pieces. A matching aid, not a shell parser:
// separators inside quotes split too.
export function commandSegments(command) {
  return joinContinuations(command)
    .split(/&&|\|\||[;|\n]/)
    .map((piece) => piece.trim())
    .filter((piece) => piece !== "");
}

function newSession() {
  const commands = [];
  const byId = new Map();
  const session = {
    commands,
    response: null,
    complete: false,
    start(id, command) {
      if (typeof command !== "string") {
        return;
      }
      const entry = { command: joinContinuations(command), output: null };
      commands.push(entry);
      if (id !== undefined) {
        byId.set(id, entry);
      }
    },
    finish(id, command, output) {
      let entry = id === undefined ? undefined : byId.get(id);
      if (!entry) {
        if (typeof command !== "string") {
          return;
        }
        session.start(id, command);
        entry = byId.get(id) ?? commands.at(-1);
      }
      entry.output = output;
    },
    end() {
      session.complete = true;
    },
    respond(text) {
      if (typeof text === "string") {
        session.response = text;
      }
    },
  };
  return session;
}

// Reads stream text `text` from `host`. Status follows the harness contract:
// `missing` when empty; `complete` when the host's terminal event is present;
// `truncated` when the events are the host's but the terminal event is absent;
// `unknown` for any other shape, including a line that is not a JSON object.
export function readHostStreamText(host, text) {
  const adapter = adapters[host];
  if (!adapter) {
    throw new Error(`unknown host: ${host}`);
  }
  const session = newSession();
  let parsed = true;
  let partial = false;
  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      continue;
    }
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      parsed = false;
      continue;
    }
    if (event === null || typeof event !== "object" || Array.isArray(event)) {
      parsed = false;
      continue;
    }
    partial ||= adapter.partial(event);
    adapter.read(event, session);
  }
  let status = "unknown";
  if (text.trim() === "") {
    status = "missing";
  } else if (parsed && session.complete) {
    status = "complete";
  } else if (parsed && partial) {
    status = "truncated";
  }
  const commands = session.commands.map((entry) => entry.command);
  return {
    status,
    response: session.response,
    commands,
    segments: commands.flatMap(commandSegments),
    outputs: session.commands
      .map((entry) => entry.output)
      .filter((output) => output !== null),
  };
}

// Reads the stream file at `path`, gunzipping it when it is gzipped.
export function readStreamFile(path) {
  if (!existsSync(path)) {
    return "";
  }
  const bytes = readFileSync(path);
  const gzipped = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  return (gzipped ? gunzipSync(bytes) : bytes).toString("utf8");
}

export function readHostStream(host, path) {
  return readHostStreamText(host, readStreamFile(path));
}

const views = {
  status: (read) => [read.status],
  response: (read) => (read.response === null ? [] : [read.response]),
  commands: (read) => read.commands.map((command) => JSON.stringify(command)),
  segments: (read) => read.segments,
  outputs: (read) => read.outputs,
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [host, path, view] = process.argv.slice(2);
  if (!adapters[host] || !path || !views[view]) {
    process.stderr.write(
      `usage: native-host-stream.mjs <${hosts.join("|")}> <stream> <${Object.keys(views).join("|")}>\n`,
    );
    process.exit(2);
  }
  const lines = views[view](readHostStream(host, path));
  process.stdout.write(lines.map((line) => `${line}\n`).join(""));
}
