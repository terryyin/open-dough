// The one reader of native host output streams (Claude, Codex, and Cursor
// stream JSON, plain or gzipped). Host event shapes live only in its per-host
// adapters (native-host-stream-adapters.mjs); callers get the started shell
// commands, their outputs, the agent's messages and final response, its other
// tool calls, and the stream status. Shell callers use the CLI
// (tests/support/native-host-stream.sh wraps it):
//
//   node tests/support/native-host-stream.mjs <host> <stream> <view>
//
// where <view> is `status`, `response`, `messages` (one JSON string per agent
// message), `commands` (one JSON string per started command), `segments`
// (each command split at its separators, one per line), `outputs` (each
// completed command's output), `calls` (one JSON object per started command:
// `command`, `output`, `exitCode`), `tools` (one JSON object per other tool
// call: `name`, `input`, `output`), `reads` (one JSON object per file read:
// `path`, `content`), or `targets` (the strings given to inspection tools, one
// per line).
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { adapters } from "./native-host-stream-adapters.mjs";

export const hosts = Object.keys(adapters);

// Joins a command's line continuations, as a shell reads them.
export function joinContinuations(command) {
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
  const tools = [];
  const messages = [];
  const byId = new Map();
  const session = {
    commands,
    tools,
    messages,
    response: null,
    complete: false,
    start(id, command) {
      if (typeof command !== "string") {
        return;
      }
      const entry = {
        command: joinContinuations(command),
        output: null,
        exitCode: null,
      };
      commands.push(entry);
      if (id !== undefined) {
        byId.set(id, entry);
      }
    },
    // Opens a non-shell tool call once per host id.
    tool(id, name, input) {
      if (typeof name !== "string" || (id !== undefined && byId.has(id))) {
        return;
      }
      const entry = { name, input: input ?? {}, output: null };
      tools.push(entry);
      if (id !== undefined) {
        byId.set(id, entry);
      }
    },
    finish(id, command, output, exitCode) {
      let entry = id === undefined ? undefined : byId.get(id);
      if (!entry) {
        if (typeof command !== "string") {
          return;
        }
        session.start(id, command);
        entry = byId.get(id) ?? commands.at(-1);
      }
      entry.output = output;
      if (Number.isInteger(exitCode)) {
        entry.exitCode = exitCode;
      }
    },
    message(text) {
      if (typeof text === "string") {
        messages.push(text);
      }
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
// `missing` when empty (a whitespace-only stream is `unknown`); `complete`
// when the host's terminal event is present; `truncated` when the events are
// the host's but the terminal event is absent; `unknown` for any other shape,
// including a line that is not a JSON object.
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
      event = null;
    }
    if (event === null || typeof event !== "object" || Array.isArray(event)) {
      parsed = false;
      continue;
    }
    partial ||= adapter.partial(event);
    adapter.read(event, session);
  }
  let status = "unknown";
  if (text === "") {
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
    // Each started command paired with its output (null if never completed)
    // and its exit code (null where the host reports none: Claude).
    calls: session.commands,
    messages: session.messages,
    // Every other tool call: its host tool name, input, and output.
    tools: session.tools,
    // Every file read: its path and the content the host returned.
    reads: session.tools.flatMap((tool) => {
      const path = adapter.readPath(tool);
      return typeof path === "string" ? [{ path, content: tool.output }] : [];
    }),
    // The strings given to inspection tools: Claude Read, Glob, and Grep
    // inputs; every Cursor non-shell tool call's arguments. Codex inspects
    // through shell commands only.
    targets: session.tools
      .filter((tool) => adapter.inspects(tool))
      .flatMap((tool) => strings(tool.input)),
  };
}

function strings(value) {
  if (typeof value === "string") {
    return [value];
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(strings);
  }
  return [];
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

const jsonLines = (entries) => entries.map((entry) => JSON.stringify(entry));
const views = {
  status: (read) => [read.status],
  response: (read) => (read.response === null ? [] : [read.response]),
  messages: (read) => jsonLines(read.messages),
  commands: (read) => jsonLines(read.commands),
  segments: (read) => read.segments,
  outputs: (read) => read.outputs,
  calls: (read) => jsonLines(read.calls),
  tools: (read) => jsonLines(read.tools),
  reads: (read) => jsonLines(read.reads),
  targets: (read) => read.targets,
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
