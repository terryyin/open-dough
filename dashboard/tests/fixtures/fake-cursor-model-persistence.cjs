"use strict";

// Native Cursor persists a startup --model into the cli-config.json of
// its effective configuration directory (CURSOR_CONFIG_DIR, or
// ~/.cursor). Simulate that persistence in whatever directory the client
// was started with, so a scoped client writes only its scope.

const fs = require("node:fs");
const path = require("node:path");

module.exports = function persistFakeCursorModel(args) {
  const modelAt = args.indexOf("--model");
  if (modelAt < 0 || args[modelAt + 1] === undefined) return;
  const configDir =
    process.env.CURSOR_CONFIG_DIR ??
    path.join(process.env.HOME ?? "", ".cursor");
  try {
    fs.mkdirSync(configDir, { recursive: true });
    const configPath = path.join(configDir, "cli-config.json");
    let current = {};
    try {
      current = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      current = {};
    }
    fs.writeFileSync(
      configPath,
      `${JSON.stringify({
        ...current,
        model: args[modelAt + 1],
        hasChangedDefaultModel: true,
      })}\n`,
    );
  } catch {
    // Persistence is a simulation detail; the attach still stands.
  }
};
