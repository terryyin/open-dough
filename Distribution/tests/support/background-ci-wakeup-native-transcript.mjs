// Reads one Claude Code session transcript for the manual background CI wakeup
// probe (`./background-ci-wakeup-native-probe.sh`): which sessions and agents
// its records name, where and under which permission mode each prompt ran,
// and how often a delivery token was received as input. No AI and no host
// process is involved, so this is also how a lost delivery response is
// reconciled.
//
// Usage: node background-ci-wakeup-native-transcript.mjs TRANSCRIPT [TOKEN]
import { readFileSync } from "node:fs";

const [file, token] = process.argv.slice(2);
if (file === undefined) {
  console.error(
    "usage: background-ci-wakeup-native-transcript.mjs TRANSCRIPT [TOKEN]",
  );
  process.exit(2);
}

// The text of a record's message: a string, or its text parts joined.
function messageText(record) {
  const content = record.message?.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) =>
      part.type === "text"
        ? part.text
        : `<${[part.type, part.name].filter(Boolean).join(" ")}>`,
    )
    .join(" ");
}

const records = readFileSync(file, "utf8")
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line, index) => ({ line: index + 1, ...JSON.parse(line) }));

const distinct = (field) => [
  ...new Set(records.map((record) => record[field]).filter((value) => value)),
];
// A prompt the session received as input, not a tool result.
const isPrompt = (record) =>
  record.type === "user" &&
  (typeof record.message?.content === "string" ||
    record.message?.content?.some?.((part) => part.type === "text"));

const turns = records
  .filter((record) => record.type === "user" || record.type === "assistant")
  .map((record) => ({
    line: record.line,
    type: isPrompt(record) ? "prompt" : record.type,
    at: record.timestamp,
    sessionId: record.sessionId,
    ...(record.isSidechain ? { sidechain: true } : {}),
    ...(record.agentId ? { agentId: record.agentId } : {}),
    ...(record.permissionMode ? { permissionMode: record.permissionMode } : {}),
    ...(record.entrypoint ? { entrypoint: record.entrypoint } : {}),
    cwd: record.cwd,
    text: messageText(record).replace(/\s+/g, " ").slice(0, 100),
  }));

const report = {
  file,
  records: records.length,
  recordTypes: Object.fromEntries(
    distinct("type").map((type) => [
      type,
      records.filter((record) => record.type === type).length,
    ]),
  ),
  sessionIds: distinct("sessionId"),
  agentIds: distinct("agentId"),
  workingDirectories: distinct("cwd"),
  permissionModes: distinct("permissionMode"),
  last: turns.at(-1)
    ? { line: turns.at(-1).line, type: turns.at(-1).type, at: turns.at(-1).at }
    : null,
  turns,
};
if (token !== undefined) {
  const received = records.filter(
    (record) => isPrompt(record) && messageText(record).includes(token),
  );
  report.token = {
    token,
    receivedAsPrompt: received.length,
    lines: received.map((record) => record.line),
    queued: records
      .filter(
        (record) =>
          !isPrompt(record) &&
          record.type !== "assistant" &&
          JSON.stringify(record).includes(token),
      )
      .map((record) => ({ line: record.line, type: record.type })),
  };
}
console.log(JSON.stringify(report, null, 1));
