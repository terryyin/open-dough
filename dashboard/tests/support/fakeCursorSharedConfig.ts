// The fake Cursor's shared configuration: the directory a session scope
// is cloned from, seeded with a model setting, a distinguishing fixture
// setting, and one saved conversation under its `chats`.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

export type FakeCursorSharedConfig = {
  // The fake's shared Cursor configuration directory (its effective
  // CURSOR_CONFIG_DIR before any session scope overrides it).
  readonly sharedConfigDir: string;
  // The shared cli-config.json bytes right now.
  sharedConfig(): string;
  // Reads a cli-config.json inside any config directory (shared or scope).
  configIn(directory: string): string;
  // Makes the shared cli-config.json unreadable as a file, so a scope
  // clone cannot be established.
  breakSharedConfig(): void;
};

export function installFakeCursorSharedConfig(
  root: string,
): FakeCursorSharedConfig {
  const sharedConfigDir = path.join(root, "shared-cursor-config");
  const sharedConfigPath = path.join(sharedConfigDir, "cli-config.json");
  mkdirSync(path.join(sharedConfigDir, "chats"), { recursive: true });
  writeFileSync(
    sharedConfigPath,
    `${JSON.stringify({
      model: "auto",
      hasChangedDefaultModel: false,
      fixtureSetting: "from-shared-config",
    })}\n`,
  );
  writeFileSync(
    path.join(sharedConfigDir, "chats", "saved-conversation.txt"),
    "saved conversation\n",
  );
  return {
    sharedConfigDir,
    sharedConfig() {
      return readFileSync(sharedConfigPath, "utf8");
    },
    configIn(directory: string) {
      return readFileSync(path.join(directory, "cli-config.json"), "utf8");
    },
    breakSharedConfig() {
      rmSync(sharedConfigPath, { force: true });
      mkdirSync(sharedConfigPath);
    },
  };
}
