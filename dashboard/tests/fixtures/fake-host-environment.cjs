"use strict";

// The part of its environment a synthetic host (./fake-claude, ./fake-codex)
// records for the launch environment rule: NODE_ENV, PATH, every npm_* key,
// INIT_CWD, the spec's pass-through marker DOUGH_SPEC_PASSTHROUGH, and the
// variables that wire that fake to its spec, where set.

const ruleKeys = ["NODE_ENV", "PATH", "INIT_CWD", "DOUGH_SPEC_PASSTHROUGH"];

module.exports = function recordedEnvironment(wiring) {
  const recorded = [...ruleKeys, ...wiring];
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => recorded.includes(key) || key.startsWith("npm_"),
    ),
  );
};
