import { makeMe } from "../support/makeMe.mjs";
import {
  handlers,
  readFragment,
  readFragments,
  readSettings,
  writeSettings,
} from "./host-hook-settings.mjs";

function empty(target) {
  for (const [host, label] of [
    ["codex", "Codex"],
    ["cursor", "Cursor"],
    ["claude", "Claude"],
  ]) {
    writeSettings(
      target,
      host,
      makeMe.hostHookSettings
        .forHost(host)
        .with({ sentinel: `keep ${label} settings` })
        .please(),
    );
  }
}

function mergeable(target) {
  writeSettings(
    target,
    "codex",
    makeMe.hostHookSettings
      .forHost("codex")
      .with({ sentinel: "keep Codex settings" })
      .handling("PostToolUse", {
        matcher: "Bash",
        command: "echo unrelated-codex-event",
      })
      .please(),
  );
  writeSettings(
    target,
    "cursor",
    makeMe.hostHookSettings
      .forHost("cursor")
      .with({
        version: 1,
        sentinel: "keep Cursor settings",
        permissionMode: "default",
      })
      .handling("sessionStart", {
        command: "echo unrelated-cursor-event",
        timeout: 1,
      })
      .handling("stop", {
        command: "echo unrelated-cursor-sibling",
        timeout: 2,
      })
      .please(),
  );
  writeSettings(
    target,
    "claude",
    makeMe.hostHookSettings
      .forHost("claude")
      .with({
        sentinel: "keep Claude settings",
        permissions: { allow: ["Bash(ls)"] },
      })
      .handling("PostToolUse", {
        matcher: "Bash",
        command: "echo unrelated-claude-matcher",
        timeout: 3,
      })
      .handling("Stop", { command: "echo unrelated-claude-stop", timeout: 4 })
      .please(),
  );
}

function exact(target, root) {
  mergeable(target);
  const { cursor, cursorGuard, claude, claudeGuard, codexGuard } =
    readFragments(root);
  for (const [host, fragments] of [
    ["codex", [codexGuard]],
    ["cursor", [cursor, cursorGuard]],
    ["claude", [claude, claudeGuard]],
  ]) {
    const settings = makeMe.hostHookSettings
      .forHost(host)
      .with(readSettings(target, host));
    if (host === "cursor") settings.with({ version: cursor.version });
    writeSettings(target, host, settings.registeredWith(...fragments).please());
  }
}

function stopRegistration(target, root, host) {
  const fragment = readFragment(root, host);
  const event = host === "cursor" ? "stop" : "Stop";
  const settings = readSettings(target, host);
  const expected = handlers(fragment, host, event)[0];
  const managed = handlers(settings, host, event).find(
    (entry) => entry.command === expected.command,
  );
  return { settings, expected, managed };
}

function removeCursor(target, root) {
  const { settings, expected } = stopRegistration(target, root, "cursor");
  settings.hooks.stop = settings.hooks.stop.filter(
    (entry) => entry.command !== expected.command,
  );
  writeSettings(target, "cursor", settings);
}

function editedTimeout(target, root) {
  exact(target, root);
  const { settings, managed } = stopRegistration(target, root, "cursor");
  managed.timeout = 99;
  writeSettings(target, "cursor", settings);
}

function suffix(target, root, host, suffix) {
  exact(target, root);
  const { settings, managed } = stopRegistration(target, root, host);
  managed.command += suffix;
  writeSettings(target, host, settings);
}

function similarlyNamed(target, root, host) {
  mergeable(target);
  const { settings, expected } = stopRegistration(target, root, host);
  const entry = { command: `${expected.command}-extra`, timeout: 5 };
  if (host === "cursor") {
    settings.hooks.stop.push(entry);
  } else {
    settings.hooks.Stop.push({ hooks: [{ type: "command", ...entry }] });
  }
  writeSettings(target, host, settings);
}

function duplicate(target, root) {
  exact(target, root);
  const { settings, expected } = stopRegistration(target, root, "cursor");
  settings.hooks.stop.push(expected);
  writeSettings(target, "cursor", settings);
}

function readMatcher(target, root) {
  exact(target, root);
  const settings = readSettings(target, "claude");
  const command = readFragment(root, "claude").hooks.PostToolUse[0].hooks[0]
    .command;
  settings.hooks.PostToolUse.find((wrapper) =>
    wrapper.hooks?.some((hook) => hook.command === command),
  ).matcher = "Read";
  writeSettings(target, "claude", settings);
}

const scenarios = {
  empty,
  mergeable,
  exact,
  removeCursor,
  editedTimeout,
  suffix,
  similarlyNamed,
  duplicate,
  readMatcher,
};
const [operation, ...args] = process.argv.slice(2);
scenarios[operation](...args);
