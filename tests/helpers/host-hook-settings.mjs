// Test-side JSON and native host-shape access; no production merge decisions.
import fs from "node:fs";

export const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
export const settingsPath = (target, host) =>
  `${target}/.${host}/${host === "claude" ? "settings" : "hooks"}.json`;

export function writeSettings(target, host, settings) {
  fs.mkdirSync(`${target}/.${host}`, { recursive: true });
  fs.writeFileSync(
    settingsPath(target, host),
    `${JSON.stringify(settings, null, 2)}\n`,
  );
}

export function readSettings(target, host) {
  return readJson(settingsPath(target, host));
}

export function readFragment(root, host) {
  return readJson(
    `${root}/src/skills/dough-execute-plan/assets/${host}-hooks.json`,
  );
}

function readGuardFragment(root, host) {
  const path = `${root}/src/skills/dough-product-backlog/assets/${host}-hooks-guard.json`;
  return fs.existsSync(path) ? readJson(path) : null;
}

export function readFragments(root) {
  return {
    cursor: readFragment(root, "cursor"),
    cursorGuard: readGuardFragment(root, "cursor"),
    claude: readFragment(root, "claude"),
    claudeGuard: readGuardFragment(root, "claude"),
    codexGuard: readGuardFragment(root, "codex"),
  };
}

export function handlers(settings, host, event) {
  const entries = settings.hooks?.[event] ?? [];
  return host === "cursor"
    ? entries
    : entries.flatMap((wrapper) => wrapper?.hooks ?? []);
}
