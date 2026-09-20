import assert from "node:assert/strict";
import {
  handlers,
  readFragments,
  readSettings,
} from "./host-hook-settings.mjs";

function unrelated(target) {
  const codex = readSettings(target, "codex");
  const cursor = readSettings(target, "cursor");
  const claude = readSettings(target, "claude");
  assert.equal(codex.sentinel, "keep Codex settings");
  assert.ok(
    codex.hooks?.PostToolUse?.some(
      (wrapper) =>
        wrapper.matcher === "Bash" &&
        wrapper.hooks?.[0]?.command === "echo unrelated-codex-event",
    ),
  );
  assert.equal(cursor.sentinel, "keep Cursor settings");
  assert.equal(cursor.permissionMode, "default");
  assert.equal(
    cursor.hooks?.sessionStart?.[0]?.command,
    "echo unrelated-cursor-event",
  );
  assert.ok(
    cursor.hooks?.stop?.some(
      (entry) => entry.command === "echo unrelated-cursor-sibling",
    ),
  );
  assert.equal(claude.sentinel, "keep Claude settings");
  assert.equal(claude.permissions?.allow?.[0], "Bash(ls)");
  assert.ok(
    claude.hooks?.PostToolUse?.some(
      (wrapper) =>
        wrapper.matcher === "Bash" &&
        wrapper.hooks?.[0]?.command === "echo unrelated-claude-matcher",
    ),
  );
  assert.ok(
    claude.hooks?.Stop?.some((wrapper) =>
      wrapper.hooks?.some(
        (hook) => hook.command === "echo unrelated-claude-stop",
      ),
    ),
  );
}

// Deliberately weaker: absent settings-file repair has no unrelated sentinel.
function cursorCommands(target, root) {
  const cursor = readSettings(target, "cursor");
  const { cursor: cursorFragment, cursorGuard } = readFragments(root);
  for (const fragment of [cursorFragment, cursorGuard].filter(Boolean)) {
    for (const [event, entries] of Object.entries(fragment.hooks)) {
      assert.ok(
        cursor.hooks?.[event]?.some(
          (entry) => entry.command === entries[0].command,
        ),
        `Cursor managed command missing for ${event}`,
      );
    }
  }
}

function managed(target, root) {
  const fragments = readFragments(root);
  for (const [host, label] of [
    ["codex", "Codex"],
    ["cursor", "Cursor"],
    ["claude", "Claude"],
  ]) {
    const settings = readSettings(target, host);
    assert.equal(settings.sentinel, `keep ${label} settings`);
    const expectedHooks =
      host === "codex"
        ? (fragments.codexGuard?.hooks ?? {})
        : host === "cursor"
          ? {
              ...fragments.cursor.hooks,
              ...(fragments.cursorGuard?.hooks ?? {}),
            }
          : {
              ...fragments.claude.hooks,
              ...(fragments.claudeGuard?.hooks ?? {}),
            };
    for (const [event, entries] of Object.entries(expectedHooks)) {
      if (host === "codex") {
        const expected = entries[0];
        const matches = settings.hooks?.[event]?.filter((wrapper) =>
          wrapper?.hooks?.some(
            (entry) => entry.command === expected.hooks[0].command,
          ),
        );
        assert.equal(
          matches?.length,
          1,
          `${label} event ${event} must contain exactly one managed command`,
        );
        assert.deepEqual(
          matches[0],
          expected,
          `${label} managed handler for ${event} differs`,
        );
        continue;
      }
      const expected = host === "cursor" ? entries[0] : entries[0].hooks[0];
      assert.ok(
        Array.isArray(settings.hooks?.[event]),
        `${label} event ${event} missing`,
      );
      const matches = handlers(settings, host, event).filter(
        (entry) => entry?.command === expected.command,
      );
      assert.equal(
        matches.length,
        1,
        `${label} event ${event} must contain exactly one managed command`,
      );
      assert.deepEqual(
        matches[0],
        expected,
        `${label} managed handler for ${event} differs`,
      );
    }
  }
}

const assertions = { unrelated, cursorCommands, managed };
const [operation, ...args] = process.argv.slice(2);
assertions[operation](...args);
