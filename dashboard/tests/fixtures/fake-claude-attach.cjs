"use strict";

// The synthetic `claude attach <id>` (./fake-claude), in this process's
// terminal. Prints `attached <id> <cols>x<rows>` unless attaches-silent
// exists, then shows Claude Code’s bordered composer and visible cursor.
// attach-prompt-delay-ms delays that prompt; keys before it are discarded.
// Echoes typing and
// `echo <line>`, clears input on Ctrl+U, prints `resized <cols>x<rows>`, exits
// on Ctrl+Z. Logs pid in attaches.jsonl, lines in attach.<pid>.lines, and
// ending signal or Ctrl+Z in attach.<pid>.ended. `/rename <name>` updates the
// listed name through `renameListed` and prints `Session renamed to: <name>`;
// renames-ignored suppresses only the update.

const fs = require("fs");
const path = require("path");

module.exports = function attach(dir, id, renameListed) {
  const size = () => `${process.stdout.columns}x${process.stdout.rows}`;
  fs.appendFileSync(
    path.join(dir, "attaches.jsonl"),
    `${JSON.stringify({ pid: process.pid, id })}\n`,
  );
  for (const signal of ["SIGHUP", "SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      fs.writeFileSync(path.join(dir, `attach.${process.pid}.ended`), signal);
      process.exit(128);
    });
  }
  const silent = fs.existsSync(path.join(dir, "attaches-silent"));
  if (!silent) process.stdout.write(`attached ${id} ${size()}\r\n`);
  process.stdout.on("resize", () => {
    process.stdout.write(`\r\nresized ${size()}\r\n`);
  });
  let ready = false;
  let promptDelayMs = 0;
  try {
    promptDelayMs = Number(
      fs.readFileSync(path.join(dir, "attach-prompt-delay-ms"), "utf8"),
    );
  } catch {
    // No control: the prompt follows the banner immediately.
  }
  const showPrompt = () => {
    ready = true;
    process.stdout.write(
      "──────────────────── Claude Code ─\r\n" +
        "❯\u00a0\r\n" +
        "──────────────────────────────────\r\n\u001b[?25h",
    );
  };
  if (!silent) {
    if (promptDelayMs > 0) setTimeout(showPrompt, promptDelayMs);
    else showPrompt();
  }
  let line = "";
  // The terminal may go before the signal that ends this process arrives.
  process.stdin.on("error", () => {});
  process.stdout.on("error", () => {});
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (typed) => {
    if (!ready) return;
    for (const key of typed) {
      if (key === "\r" || key === "\n") {
        fs.appendFileSync(
          path.join(dir, `attach.${process.pid}.lines`),
          `${JSON.stringify(line)}\n`,
        );
        const renamed = /^\/rename (.+)$/.exec(line)?.[1];
        if (renamed === undefined) {
          process.stdout.write(`\r\necho ${line}\r\n`);
        } else {
          // A `renames-ignored` file leaves the listed name as it was.
          if (!fs.existsSync(path.join(dir, "renames-ignored"))) {
            renameListed(renamed);
          }
          process.stdout.write(`\r\nSession renamed to: ${renamed}\r\n`);
        }
        line = "";
      } else if (key === "\u001a") {
        fs.writeFileSync(
          path.join(dir, `attach.${process.pid}.ended`),
          "Ctrl+Z",
        );
        process.stdout.write("\r\ndetached\r\n", () => {
          process.exit(0);
        });
        return;
      } else if (key === "\u0015") {
        line = "";
        process.stdout.write("\r\u001b[K");
      } else {
        line += key;
        process.stdout.write(key);
      }
    }
  });
};
