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

seed_exact_manual_registration() {
  local target=$1
  local cursor_fragment="${source_dir}/src/skills/dough-execute-plan/assets/cursor-hooks.json"
  local claude_fragment="${source_dir}/src/skills/dough-execute-plan/assets/claude-hooks.json"
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

seed_edited_managed_timeout() {
  local target=$1
  local cursor_fragment="${source_dir}/src/skills/dough-execute-plan/assets/cursor-hooks.json"
  seed_exact_manual_registration "${target}"
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

assert_managed_host_hooks() {
  local target=$1
  local cursor_fragment="${source_dir}/src/skills/dough-execute-plan/assets/cursor-hooks.json"
  local claude_fragment="${source_dir}/src/skills/dough-execute-plan/assets/claude-hooks.json"
  node - "${target}" "${cursor_fragment}" "${claude_fragment}" << 'EOF'
const fs = require("node:fs");
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
  if (JSON.stringify(exact) !== JSON.stringify(managed)) {
    console.error(`FAIL: Cursor managed handler for ${event} does not match the fragment.`);
    process.exit(1);
  }
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
  if (JSON.stringify(exact) !== JSON.stringify(managedHook)) {
    console.error(`FAIL: Claude managed handler for ${event} does not match the fragment.`);
    process.exit(1);
  }
}
EOF
}
