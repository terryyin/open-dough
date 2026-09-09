#!/usr/bin/env bash
# Host hook settings fixtures and assertions for installer journeys.
# Requires source_dir.

: "${source_dir:?source_dir must be set before sourcing this helper}"

seed_empty_host_settings() {
  local target=$1
  mkdir -p -- "${target}/.cursor" "${target}/.claude"
  printf '%s\n' '{"hooks":{},"sentinel":"keep Cursor settings"}' > "${target}/.cursor/hooks.json"
  printf '%s\n' '{"hooks":{},"sentinel":"keep Claude settings"}' > "${target}/.claude/settings.json"
}

seed_mergeable_host_settings() {
  local target=$1
  mkdir -p -- "${target}/.cursor" "${target}/.claude"
  node - "${target}" << 'EOF'
const fs = require("node:fs");
const target = process.argv[2];
const cursor = {
  version: 1,
  sentinel: "keep Cursor settings",
  permissionMode: "default",
  hooks: {
    sessionStart: [{ command: "echo unrelated-cursor-event", timeout: 1 }],
    stop: [{ command: "echo unrelated-cursor-sibling", timeout: 2 }],
  },
};
const claude = {
  sentinel: "keep Claude settings",
  permissions: { allow: ["Bash(ls)"] },
  hooks: {
    PostToolUse: [
      {
        matcher: "Bash",
        hooks: [
          {
            type: "command",
            command: "echo unrelated-claude-matcher",
            timeout: 3,
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command: "echo unrelated-claude-stop",
            timeout: 4,
          },
        ],
      },
    ],
  },
};
fs.writeFileSync(`${target}/.cursor/hooks.json`, `${JSON.stringify(cursor, null, 2)}\n`);
fs.writeFileSync(`${target}/.claude/settings.json`, `${JSON.stringify(claude, null, 2)}\n`);
EOF
}

# Sets cursor_fragment and claude_fragment from a release checkout or source root
# (default: current source_dir). Prefer an older tagged checkout when modeling a
# release that changes managed entries; do not invent arbitrary local variants.
resolve_host_hook_fragments() {
  local fragment_root=$1
  if [[ $# -lt 1 || -z "${fragment_root}" ]]; then
    fragment_root=${source_dir}
  fi
  cursor_fragment="${fragment_root}/src/skills/dough-execute-plan/assets/cursor-hooks.json"
  claude_fragment="${fragment_root}/src/skills/dough-execute-plan/assets/claude-hooks.json"
}

seed_exact_manual_registration() {
  local target=$1
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${2-}"
  seed_mergeable_host_settings "${target}"
  node - "${target}" "${cursor_fragment}" "${claude_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, cursorFragmentPath, claudeFragmentPath] = process.argv.slice(2);
const cursorFragment = JSON.parse(fs.readFileSync(cursorFragmentPath, "utf8"));
const claudeFragment = JSON.parse(fs.readFileSync(claudeFragmentPath, "utf8"));
const cursorPath = `${target}/.cursor/hooks.json`;
const claudePath = `${target}/.claude/settings.json`;
const cursor = JSON.parse(fs.readFileSync(cursorPath, "utf8"));
const claude = JSON.parse(fs.readFileSync(claudePath, "utf8"));
cursor.version = cursorFragment.version;
cursor.hooks.beforeSubmitPrompt = cursorFragment.hooks.beforeSubmitPrompt;
cursor.hooks.postToolUse = cursorFragment.hooks.postToolUse;
cursor.hooks.stop = [
  ...cursor.hooks.stop,
  ...cursorFragment.hooks.stop,
];
claude.hooks.PostToolUse = [
  ...claude.hooks.PostToolUse,
  ...claudeFragment.hooks.PostToolUse,
];
claude.hooks.Stop = [
  ...claude.hooks.Stop,
  ...claudeFragment.hooks.Stop,
];
fs.writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\n`);
fs.writeFileSync(claudePath, `${JSON.stringify(claude, null, 2)}\n`);
EOF
}

# Removes one managed Cursor stop handler so equal-version update can repair it.
remove_one_cursor_managed_entry() {
  local target=$1
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${2-}"
  node - "${target}" "${cursor_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, fragmentPath] = process.argv.slice(2);
const fragment = JSON.parse(fs.readFileSync(fragmentPath, "utf8"));
const path = `${target}/.cursor/hooks.json`;
const doc = JSON.parse(fs.readFileSync(path, "utf8"));
const managed = fragment.hooks.stop[0].command;
doc.hooks.stop = (doc.hooks.stop || []).filter((handler) => handler.command !== managed);
fs.writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`);
EOF
}

seed_edited_managed_timeout() {
  local target=$1
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${2-}"
  seed_exact_manual_registration "${target}" "${2-}"
  node - "${target}" "${cursor_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, cursorFragmentPath] = process.argv.slice(2);
const cursorFragment = JSON.parse(fs.readFileSync(cursorFragmentPath, "utf8"));
const managedCommand = cursorFragment.hooks.stop[0].command;
const cursorPath = `${target}/.cursor/hooks.json`;
const cursor = JSON.parse(fs.readFileSync(cursorPath, "utf8"));
for (const handler of cursor.hooks.stop) {
  if (handler.command === managedCommand) {
    handler.timeout = 99;
  }
}
fs.writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\n`);
EOF
}

seed_managed_command_with_local_argument() {
  local target=$1
  seed_managed_command_with_suffix "${target}" cursor ' --local' "${2-}"
}

seed_managed_command_with_suffix() {
  local target=$1 host=$2 suffix=$3
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${4-}"
  seed_exact_manual_registration "${target}" "${4-}"
  if [[ "${host}" == cursor ]]; then
    node - "${target}" "${cursor_fragment}" "${suffix}" << 'EOF'
const fs = require("node:fs");
const [target, cursorFragmentPath, suffix] = process.argv.slice(2);
const cursorFragment = JSON.parse(fs.readFileSync(cursorFragmentPath, "utf8"));
const managedCommand = cursorFragment.hooks.stop[0].command;
const cursorPath = `${target}/.cursor/hooks.json`;
const cursor = JSON.parse(fs.readFileSync(cursorPath, "utf8"));
const handler = cursor.hooks.stop.find((entry) => entry.command === managedCommand);
handler.command = `${handler.command}${suffix}`;
fs.writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\n`);
EOF
  else
    node - "${target}" "${claude_fragment}" "${suffix}" << 'EOF'
const fs = require("node:fs");
const [target, claudeFragmentPath, suffix] = process.argv.slice(2);
const claudeFragment = JSON.parse(fs.readFileSync(claudeFragmentPath, "utf8"));
const managedCommand = claudeFragment.hooks.Stop[0].hooks[0].command;
const claudePath = `${target}/.claude/settings.json`;
const claude = JSON.parse(fs.readFileSync(claudePath, "utf8"));
const wrapper = claude.hooks.Stop.find((entry) =>
  entry.hooks?.some((hook) => hook.command === managedCommand),
);
const hook = wrapper.hooks.find((entry) => entry.command === managedCommand);
hook.command = `${hook.command}${suffix}`;
fs.writeFileSync(claudePath, `${JSON.stringify(claude, null, 2)}\n`);
EOF
  fi
}

# A distinct script that merely shares the managed command as a name prefix
# (no delimiter boundary) must stay unrelated, not be treated as an edited
# managed variant.
seed_similarly_named_unmanaged_script() {
  local target=$1 host=$2
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${3-}"
  seed_mergeable_host_settings "${target}"
  if [[ "${host}" == cursor ]]; then
    node - "${target}" "${cursor_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, cursorFragmentPath] = process.argv.slice(2);
const cursorFragment = JSON.parse(fs.readFileSync(cursorFragmentPath, "utf8"));
const managedCommand = cursorFragment.hooks.stop[0].command;
const cursorPath = `${target}/.cursor/hooks.json`;
const cursor = JSON.parse(fs.readFileSync(cursorPath, "utf8"));
cursor.hooks.stop.push({ command: `${managedCommand}-extra`, timeout: 5 });
fs.writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\n`);
EOF
  else
    node - "${target}" "${claude_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, claudeFragmentPath] = process.argv.slice(2);
const claudeFragment = JSON.parse(fs.readFileSync(claudeFragmentPath, "utf8"));
const managedCommand = claudeFragment.hooks.Stop[0].hooks[0].command;
const claudePath = `${target}/.claude/settings.json`;
const claude = JSON.parse(fs.readFileSync(claudePath, "utf8"));
claude.hooks.Stop.push({
  hooks: [
    {
      type: "command",
      command: `${managedCommand}-extra`,
      timeout: 5,
    },
  ],
});
fs.writeFileSync(claudePath, `${JSON.stringify(claude, null, 2)}\n`);
EOF
  fi
}

seed_duplicate_exact_managed_entry() {
  local target=$1
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${2-}"
  seed_exact_manual_registration "${target}" "${2-}"
  node - "${target}" "${cursor_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, cursorFragmentPath] = process.argv.slice(2);
const cursorFragment = JSON.parse(fs.readFileSync(cursorFragmentPath, "utf8"));
const cursorPath = `${target}/.cursor/hooks.json`;
const cursor = JSON.parse(fs.readFileSync(cursorPath, "utf8"));
cursor.hooks.stop.push(structuredClone(cursorFragment.hooks.stop[0]));
fs.writeFileSync(cursorPath, `${JSON.stringify(cursor, null, 2)}\n`);
EOF
}

seed_claude_managed_read_matcher() {
  local target=$1
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${2-}"
  seed_exact_manual_registration "${target}" "${2-}"
  node - "${target}" "${claude_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, claudeFragmentPath] = process.argv.slice(2);
const claudeFragment = JSON.parse(fs.readFileSync(claudeFragmentPath, "utf8"));
const managedCommand = claudeFragment.hooks.PostToolUse[0].hooks[0].command;
const claudePath = `${target}/.claude/settings.json`;
const claude = JSON.parse(fs.readFileSync(claudePath, "utf8"));
const wrapper = claude.hooks.PostToolUse.find((entry) =>
  entry.hooks?.some((hook) => hook.command === managedCommand),
);
wrapper.matcher = "Read";
fs.writeFileSync(claudePath, `${JSON.stringify(claude, null, 2)}\n`);
EOF
}

assert_unrelated_preserved() {
  local target=$1
  node - "${target}" << 'EOF'
const fs = require("node:fs");
const target = process.argv[2];
const cursor = JSON.parse(fs.readFileSync(`${target}/.cursor/hooks.json`, "utf8"));
const claude = JSON.parse(fs.readFileSync(`${target}/.claude/settings.json`, "utf8"));
if (cursor.sentinel !== "keep Cursor settings") {
  console.error("FAIL: Cursor sentinel missing.");
  process.exit(1);
}
if (cursor.permissionMode !== "default") {
  console.error("FAIL: Cursor unrelated top-level permissionMode was not preserved.");
  process.exit(1);
}
if (!Array.isArray(cursor.hooks?.sessionStart) || cursor.hooks.sessionStart[0]?.command !== "echo unrelated-cursor-event") {
  console.error("FAIL: Cursor unrelated event handler was not preserved.");
  process.exit(1);
}
if (!cursor.hooks?.stop?.some((handler) => handler.command === "echo unrelated-cursor-sibling")) {
  console.error("FAIL: Cursor unrelated stop sibling was not preserved.");
  process.exit(1);
}
if (claude.sentinel !== "keep Claude settings") {
  console.error("FAIL: Claude sentinel missing.");
  process.exit(1);
}
if (claude.permissions?.allow?.[0] !== "Bash(ls)") {
  console.error("FAIL: Claude unrelated permissions were not preserved.");
  process.exit(1);
}
const post = claude.hooks?.PostToolUse;
if (!Array.isArray(post) || !post.some((wrapper) => wrapper.matcher === "Bash" && wrapper.hooks?.[0]?.command === "echo unrelated-claude-matcher")) {
  console.error("FAIL: Claude unrelated matcher sibling was not preserved.");
  process.exit(1);
}
const stop = claude.hooks?.Stop;
if (!Array.isArray(stop) || !stop.some((wrapper) => wrapper.hooks?.some((hook) => hook.command === "echo unrelated-claude-stop"))) {
  console.error("FAIL: Claude unrelated Stop sibling was not preserved.");
  process.exit(1);
}
EOF
}

# Managed Cursor commands only — for repair of an absent settings file that had
# no unrelated values to preserve.
assert_cursor_managed_commands() {
  local target=$1
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${2-}"
  node - "${target}" "${cursor_fragment}" << 'EOF'
const fs = require("node:fs");
const [target, fragmentPath] = process.argv.slice(2);
const fragment = JSON.parse(fs.readFileSync(fragmentPath, "utf8"));
const cursor = JSON.parse(fs.readFileSync(`${target}/.cursor/hooks.json`, "utf8"));
for (const [event, entries] of Object.entries(fragment.hooks)) {
  const managed = entries[0];
  const handlers = cursor.hooks?.[event];
  if (!Array.isArray(handlers) || !handlers.some((handler) => handler.command === managed.command)) {
    console.error(`FAIL: Cursor managed command missing for ${event}.`);
    process.exit(1);
  }
}
EOF
}

# Optional second argument selects which release's fragments define the expected
# managed entries (default: current source_dir / latest under test).
assert_managed_host_hooks() {
  local target=$1
  local cursor_fragment claude_fragment
  resolve_host_hook_fragments "${2-}"
  node - "${target}" "${cursor_fragment}" "${claude_fragment}" << 'EOF'
const fs = require("node:fs");
const assert = require("node:assert/strict");
const [target, cursorFragmentPath, claudeFragmentPath] = process.argv.slice(2);
const cursorFragment = JSON.parse(fs.readFileSync(cursorFragmentPath, "utf8"));
const claudeFragment = JSON.parse(fs.readFileSync(claudeFragmentPath, "utf8"));
const cursor = JSON.parse(fs.readFileSync(`${target}/.cursor/hooks.json`, "utf8"));
const claude = JSON.parse(fs.readFileSync(`${target}/.claude/settings.json`, "utf8"));
if (cursor.sentinel !== "keep Cursor settings") {
  console.error("FAIL: Cursor unrelated top-level value was not preserved.");
  process.exit(1);
}
if (claude.sentinel !== "keep Claude settings") {
  console.error("FAIL: Claude unrelated top-level value was not preserved.");
  process.exit(1);
}

function countExact(entries, predicate) {
  let count = 0;
  for (const entry of entries) {
    if (predicate(entry)) {
      count += 1;
    }
  }
  return count;
}

function requireDeepEqual(actual, expected, message) {
  try {
    assert.deepStrictEqual(actual, expected);
  } catch {
    console.error(message);
    process.exit(1);
  }
}

for (const [event, fragmentEntries] of Object.entries(cursorFragment.hooks)) {
  const managed = fragmentEntries[0];
  const handlers = cursor.hooks?.[event];
  if (!Array.isArray(handlers)) {
    console.error(`FAIL: Cursor event ${event} is missing after install.`);
    process.exit(1);
  }
  const managedCount = countExact(
    handlers,
    (handler) => handler && handler.command === managed.command,
  );
  if (managedCount !== 1) {
    console.error(
      `FAIL: Cursor event ${event} must contain exactly one managed command; found ${managedCount}.`,
    );
    process.exit(1);
  }
  const exact = handlers.find((handler) => handler.command === managed.command);
  requireDeepEqual(
    exact,
    managed,
    `FAIL: Cursor managed handler for ${event} does not match the fragment.`,
  );
}

for (const [event, fragmentEntries] of Object.entries(claudeFragment.hooks)) {
  const managedHook = fragmentEntries[0].hooks[0];
  const wrappers = claude.hooks?.[event];
  if (!Array.isArray(wrappers)) {
    console.error(`FAIL: Claude event ${event} is missing after install.`);
    process.exit(1);
  }
  let managedCount = 0;
  let exact = null;
  for (const wrapper of wrappers) {
    if (!wrapper || !Array.isArray(wrapper.hooks)) {
      continue;
    }
    for (const hook of wrapper.hooks) {
      if (hook && hook.command === managedHook.command) {
        managedCount += 1;
        exact = hook;
      }
    }
  }
  if (managedCount !== 1) {
    console.error(
      `FAIL: Claude event ${event} must contain exactly one managed command; found ${managedCount}.`,
    );
    process.exit(1);
  }
  requireDeepEqual(
    exact,
    managedHook,
    `FAIL: Claude managed handler for ${event} does not match the fragment.`,
  );
}
EOF
}
