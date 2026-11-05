"use strict";

// The synthetic `claude attach <id>` (./fake-claude), in this process's
// terminal. Prints `attached <id> <cols>x<rows>` unless attaches-silent
// exists, then shows Claude Code’s bordered composer and visible cursor.
// attach-prompt-delay-ms delays that prompt; keys before it are discarded.
// When attach-menu exists, the prompt is an option menu (↑/↓ move, Enter
// confirms, Esc cancels) instead of the composer, so phone toolbar tests can
// separate arrow navigation from scrollback swipes.
// attach-bracketed-paste enables bracketed paste in the composer.
// Echoes typing and
// `echo <line>`, edits with Backspace, clears input on Ctrl+U, prints `resized <cols>x<rows>`, exits
// on Ctrl+Z. Logs pid and recorded environment (./fake-claude) in
// attaches.jsonl, lines in attach.<pid>.lines, and
// ending signal or Ctrl+Z in attach.<pid>.ended. `/rename <name>` updates the
// listed name through `renameListed` and prints `Session renamed to: <name>`;
// renames-ignored suppresses only the update.

const fs = require("fs");
const path = require("path");

module.exports = function attach(dir, id, env, renameListed, workspace) {
  const size = () => `${process.stdout.columns}x${process.stdout.rows}`;
  fs.appendFileSync(
    path.join(dir, "attaches.jsonl"),
    `${JSON.stringify({ pid: process.pid, id, env })}\n`,
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
  const menuMode = fs.existsSync(path.join(dir, "attach-menu"));
  const bracketedPaste = fs.existsSync(
    path.join(dir, "attach-bracketed-paste"),
  );
  const menuOptions = ["Red", "Blue", "Green"];
  let menuIndex = 0;
  let inMenu = menuMode;
  const paintMenu = () => {
    const history = [...Array(80).keys()]
      .map((line) => `menu history ${line}`)
      .join("\r\n");
    const rows = menuOptions.map(
      (option, index) => `${index === menuIndex ? "›" : " "} ${option}`,
    );
    // Keep earlier lines in the scrollback so a swipe can move history while
    // the option marker stays put until an arrow key arrives.
    process.stdout.write(
      `\u001b[2J\u001b[H` +
        `${history}\r\n` +
        `Choose a color\r\n${rows.join(
          "\r\n",
        )}\r\n↑/↓ option · Enter confirm · Esc cancel\r\n\u001b[?25h`,
    );
  };
  const showComposer = () => {
    inMenu = false;
    ready = true;
    process.stdout.write(
      `${bracketedPaste ? "\u001b[?2004h" : ""} Claude Code ─\r\n` +
        `❯\u00a0\r\n` +
        `──────────────────────────────────\r\n\u001b[?25h`,
    );
  };
  const showPrompt = () => {
    ready = true;
    if (menuMode) paintMenu();
    else showComposer();
  };
  if (!silent) {
    if (promptDelayMs > 0) setTimeout(showPrompt, promptDelayMs);
    else showPrompt();
  }
  let line = "";
  let pending = "";
  const pasteStart = "\u001b[200~";
  const pasteEnd = "\u001b[201~";
  // The terminal may go before the signal that ends this process arrives.
  process.stdin.on("error", () => {});
  process.stdout.on("error", () => {});
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (typed) => {
    if (!ready) return;
    pending += typed;
    while (pending.length > 0) {
      if (inMenu) {
        if (pending.startsWith("\u001b[A")) {
          pending = pending.slice(3);
          menuIndex = Math.max(0, menuIndex - 1);
          paintMenu();
          continue;
        }
        if (pending.startsWith("\u001b[B")) {
          pending = pending.slice(3);
          menuIndex = Math.min(menuOptions.length - 1, menuIndex + 1);
          paintMenu();
          continue;
        }
        if (pending.startsWith("\u001b[C") || pending.startsWith("\u001b[D")) {
          pending = pending.slice(3);
          continue;
        }
        // Incomplete CSI only (`ESC [` …); a lone ESC cancels immediately.
        if (pending.startsWith("\u001b[") && pending.length < 3) return;
        if (pending.startsWith("\u001b")) {
          pending = pending.slice(1);
          process.stdout.write("\u001b[2J\u001b[Hcancelled\r\n");
          showComposer();
          continue;
        }
        if (pending.startsWith("\r") || pending.startsWith("\n")) {
          pending = pending.slice(1);
          const chosen = menuOptions[menuIndex] ?? "";
          fs.appendFileSync(
            path.join(dir, `attach.${process.pid}.lines`),
            `${JSON.stringify(chosen)}\n`,
          );
          process.stdout.write(`\r\necho ${chosen}\r\n`);
          showComposer();
          continue;
        }
        pending = pending.slice(1);
        continue;
      }
      if (bracketedPaste && pending.startsWith(pasteStart)) {
        const end = pending.indexOf(pasteEnd, pasteStart.length);
        if (end < 0) return;
        const text = pending.slice(pasteStart.length, end);
        line += text;
        process.stdout.write(text.replace(/\r/g, "\r\n"));
        pending = pending.slice(end + pasteEnd.length);
        continue;
      }
      if (bracketedPaste && pasteStart.startsWith(pending)) return;
      const key = pending[0];
      pending = pending.slice(1);
      if (key === "\r" || key === "\n") {
        fs.appendFileSync(
          path.join(dir, `attach.${process.pid}.lines`),
          `${JSON.stringify(line)}\n`,
        );
        const renamed = /^\/rename (.+)$/.exec(line)?.[1];
        if (renamed === undefined) {
          // A test may give this external host one response to a follow-up.
          // Work runs in the conversation's native retained workspace, never
          // a workspace supplied by terminal input or a product-state stub.
          const actionFile = path.join(dir, "attach-action.json");
          if (fs.existsSync(actionFile)) {
            const action = JSON.parse(fs.readFileSync(actionFile, "utf8"));
            if (action.input === line) {
              require("node:child_process").execFileSync(
                action.command,
                action.args,
                {
                  cwd: workspace,
                  stdio: "pipe",
                },
              );
            }
          }
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
      } else if (key === "\u007f" || key === "\u0008") {
        if (line.length > 0) {
          line = line.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        line += key;
        process.stdout.write(key);
      }
    }
  });
};
