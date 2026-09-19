#!/usr/bin/env node
// Native PreToolUse guard: denies a Claude Code Edit/Write/MultiEdit/
// NotebookEdit call or a Codex apply_patch call whose target is this project's
// resolved whole product backlog file, so an agent uses the installed
// dough-product-backlog scripts (product-backlog.mjs and its Git adapters)
// instead of a direct hand-edit.
//
// Each host registers this hook only for its native editing boundary (see
// ../assets/*-hooks-guard.json), so it never runs for, and never affects, a
// read, a Bash-invoked script (including one that writes the backlog via shell
// redirection), an edit to any other file, or a human editing the file outside
// an agent tool call.
//
// Delivered through src/install/open-dough-register-hooks.mjs, the same safe
// JSON merge mechanism dough-execute-plan's own CI hooks already use.

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { defaultBacklogPath } from "./product-backlog-store.mjs";

const GUARDED_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

function codexPatchPaths(command) {
  if (typeof command !== "string") {
    return [];
  }
  const paths = [];
  for (const line of command.split(/\r?\n/u)) {
    const fileDirective = line.match(
      /^\*\*\* (?:Add|Delete|Update) File: (.+)$/u,
    );
    if (fileDirective) {
      paths.push(fileDirective[1]);
      continue;
    }
    const moveDirective = line.match(/^\*\*\* Move to: (.+)$/u);
    if (moveDirective) {
      paths.push(moveDirective[1]);
    }
  }
  return paths;
}

function candidatePaths(toolName, toolInput) {
  if (!toolInput || typeof toolInput !== "object") {
    return [];
  }
  if (toolName === "apply_patch") {
    return codexPatchPaths(toolInput.command);
  }
  const paths = [];
  if (typeof toolInput.file_path === "string") {
    paths.push(toolInput.file_path);
  }
  // NotebookEdit's own field name is unconfirmed against every Claude Code
  // version; checking both keeps this guard correct if it differs, at no
  // cost when it does not.
  if (
    toolName === "NotebookEdit" &&
    typeof toolInput.notebook_path === "string"
  ) {
    paths.push(toolInput.notebook_path);
  }
  return paths;
}

// Exported for direct, native-process-free testing of the decision itself.
export function evaluateGuard(input, projectDir) {
  const toolName = input?.tool_name;
  if (!GUARDED_TOOLS.has(toolName) && toolName !== "apply_patch") {
    return null;
  }
  const protectedPath = resolve(projectDir, defaultBacklogPath);
  const targets = candidatePaths(toolName, input.tool_input).map((path) =>
    resolve(projectDir, path),
  );
  if (!targets.includes(protectedPath)) {
    return null;
  }
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        `Direct ${toolName} edits to ${defaultBacklogPath} are blocked. Use ` +
        "the installed dough-product-backlog scripts (product-backlog.mjs " +
        "and its Git merge/rebase/cherry-pick adapters) to change the " +
        "backlog instead.",
    },
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const projectDir = process.argv[2] ?? process.cwd();
  let raw = "";
  for await (const chunk of process.stdin) {
    raw += chunk;
  }
  try {
    const input = raw.trim() ? JSON.parse(raw) : {};
    const decision = evaluateGuard(input, projectDir);
    if (decision) {
      await new Promise((res, reject) =>
        process.stdout.write(`${JSON.stringify(decision)}\n`, (error) =>
          error ? reject(error) : res(),
        ),
      );
    }
  } catch (error) {
    process.stderr.write(
      `product-backlog guard hook failed: ${String(error).slice(0, 600)}\n`,
    );
    process.exitCode = 1;
  }
}
