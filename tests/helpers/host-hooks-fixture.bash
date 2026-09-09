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
if (JSON.stringify(cursor.hooks) !== JSON.stringify(cursorFragment.hooks)) {
  console.error("FAIL: Cursor hooks do not match the authoritative fragment.");
  process.exit(1);
}
if (JSON.stringify(claude.hooks) !== JSON.stringify(claudeFragment.hooks)) {
  console.error("FAIL: Claude hooks do not match the authoritative fragment.");
  process.exit(1);
}
EOF
}
