// Test-side JSON and native host-shape access; no production merge decisions.
import fs from "node:fs";

export const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
export const settingsPath = (target, host) =>
  `${target}/.${host}/${host === "cursor" ? "hooks" : "settings"}.json`;

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

export function readFragments(root) {
  const guard = `${root}/src/skills/dough-product-backlog/assets/claude-hooks-guard.json`;
  return {
    cursor: readFragment(root, "cursor"),
    claude: readFragment(root, "claude"),
    guard: fs.existsSync(guard) ? readJson(guard) : null,
  };
}

export function handlers(settings, host, event) {
  const entries = settings.hooks?.[event] ?? [];
  return host === "cursor"
    ? entries
    : entries.flatMap((wrapper) => wrapper?.hooks ?? []);
}
