// Drives one interactive host command in a pseudo-terminal for the manual
// background CI wakeup probe (`./background-ci-wakeup-native-probe.sh`), which
// alone runs it: a standalone interactive session and `claude attach` have no
// non-terminal form. It only presses what its caller lists, in order, and
// retains the terminal's text.
//
// Usage: node background-ci-wakeup-native-pty.mjs CWD LOG ACTION… -- COMMAND ARG…
// Actions: quiet:MS    wait until nothing was printed for MS (at most 90 s)
//          sleep:MS    wait MS
//          text:STRING type STRING without submitting it
//          key:NAME    press enter, esc, ctrl-c, ctrl-d, ctrl-z, left or down
//          until:TEXT  wait until the terminal has printed TEXT (at most 90 s)
// The command is ended when the actions are done: a foreground session ends,
// an attachment only detaches.
import { appendFileSync, writeFileSync } from "node:fs";
import { stripVTControlCharacters } from "node:util";
import { spawn } from "@lydell/node-pty";

const keys = {
  enter: "\r",
  esc: "\u001b",
  "ctrl-c": "\u0003",
  "ctrl-d": "\u0004",
  "ctrl-z": "\u001a",
  left: "\u001b[D",
  down: "\u001b[B",
};
const longestWaitMs = 90_000;

const [cwd, log, ...rest] = process.argv.slice(2);
const split = rest.indexOf("--");
if (cwd === undefined || log === undefined || split < 0 || !rest[split + 1]) {
  console.error(
    "usage: background-ci-wakeup-native-pty.mjs CWD LOG ACTION… -- COMMAND ARG…",
  );
  process.exit(2);
}
const actions = rest.slice(0, split);
const [command, ...args] = rest.slice(split + 1);

writeFileSync(log, "");
const note = (line) =>
  appendFileSync(log, `\n[probe ${new Date().toISOString()}] ${line}\n`);
let printed = "";
let lastOutputAt = Date.now();
let exited;
const terminal = spawn(command, args, {
  name: "xterm-256color",
  cwd,
  env: process.env,
  cols: 120,
  rows: 40,
});
terminal.onData((data) => {
  const text = stripVTControlCharacters(data);
  printed += text;
  lastOutputAt = Date.now();
  appendFileSync(log, text);
});
terminal.onExit(({ exitCode, signal }) => {
  exited = { exitCode, signal };
  note(`exited ${JSON.stringify(exited)}`);
});

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(done) {
  const deadline = Date.now() + longestWaitMs;
  while (!done() && exited === undefined && Date.now() < deadline)
    await pause(100);
  return done();
}

for (const action of actions) {
  const at = action.indexOf(":");
  const kind = action.slice(0, at);
  const value = action.slice(at + 1);
  if (exited !== undefined) break;
  note(`action ${kind}:${kind === "text" ? JSON.stringify(value) : value}`);
  if (kind === "quiet") {
    await waitFor(() => Date.now() - lastOutputAt >= Number(value));
  } else if (kind === "sleep") {
    await pause(Number(value));
  } else if (kind === "until") {
    const seen = await waitFor(() => printed.includes(value));
    note(`until ${seen ? "seen" : "not seen"}`);
  } else if (kind === "text") {
    terminal.write(value);
  } else if (kind === "key" && keys[value] !== undefined) {
    terminal.write(keys[value]);
  } else {
    note(`unknown action ${action}`);
    terminal.kill();
    process.exit(2);
  }
}
if (exited === undefined) {
  note("ending the terminal");
  terminal.kill();
  await waitFor(() => exited !== undefined);
}
console.log(JSON.stringify({ log, exited: exited ?? null }));
process.exit(0);
