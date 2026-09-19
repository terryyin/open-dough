// Authoritative host-hook fragment inventory and loading for Open Dough's
// settings-merge registration. Kept separate from the orchestrator
// (open-dough-register-hooks.mjs) to stay under this project's file-size
// convention once the product-backlog guard fragment joined the existing CI
// fragments.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Each host merges one *combined* fragment into its settings file, built from
// one or more authoritative source fragments. A fragment is `required` when
// its absence means the payload itself is incomplete. The Claude
// product-backlog guard remains optional for an older source checkout that
// predates it; the Codex guard is required once that host is declared.
export const HOSTS = [
  {
    id: "codex",
    relativePath: ".codex/hooks.json",
    fragments: [
      {
        name: "codex-hooks-guard.json",
        assetsDir: "src/skills/dough-product-backlog/assets",
        required: true,
      },
    ],
  },
  {
    id: "cursor",
    relativePath: ".cursor/hooks.json",
    fragments: [
      {
        name: "cursor-hooks.json",
        assetsDir: "src/skills/dough-execute-plan/assets",
        required: true,
      },
    ],
  },
  {
    id: "claude",
    relativePath: ".claude/settings.json",
    fragments: [
      {
        name: "claude-hooks.json",
        assetsDir: "src/skills/dough-execute-plan/assets",
        required: true,
      },
      {
        name: "claude-hooks-guard.json",
        assetsDir: "src/skills/dough-product-backlog/assets",
        required: false,
      },
    ],
  },
];

export function readJsonFile(path) {
  const text = readFileSync(path, "utf8");
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error(
      `malformed-hooks-settings: ${path} is not valid JSON.`,
    );
    error.code = "malformed-hooks-settings";
    throw error;
  }
}

function loadFragment(sourceDir, fragment) {
  const path = join(sourceDir, fragment.assetsDir, fragment.name);
  if (!existsSync(path)) {
    if (fragment.required) {
      throw new Error(`Client payload is incomplete: missing ${fragment.name}`);
    }
    return null;
  }
  return readJsonFile(path);
}

// Unions each source fragment's own hooks map into one combined fragment
// document. Today's authoritative fragments never declare the same event
// twice across sources for one host; a future collision fails loudly here
// rather than silently keeping only one side.
function combineFragments(fragments, host) {
  const hooks = {};
  for (const fragment of fragments) {
    if (fragment === null) {
      continue;
    }
    for (const [event, entries] of Object.entries(fragment.hooks ?? {})) {
      if (Object.hasOwn(hooks, event)) {
        throw new Error(
          `Multiple Open Dough fragments declare ${host.id}'s ${event} event; combine them in one source fragment.`,
        );
      }
      hooks[event] = entries;
    }
  }
  return { hooks };
}

export function loadHostFragment(sourceDir, host) {
  const loaded = host.fragments.map((fragment) =>
    loadFragment(sourceDir, fragment),
  );
  return combineFragments(loaded, host);
}
