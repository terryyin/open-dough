// The terminal theme chosen in System settings, kept in one file under this
// machine's home so dev and preview share it. Read afresh for every use and
// replaced atomically; it is not a secret.
import { mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import {
  isTerminalThemeId,
  type TerminalThemeId,
} from "../src/terminalThemes.ts";
import { replaceFile } from "./fileReplacement.ts";

export class TerminalThemeProblem extends Error {}

function terminalThemeFile(): string {
  return path.join(homedir(), ".open-dough/dashboard/terminal-theme.json");
}

const unreadable =
  "The saved terminal theme could not be read. Check its file permissions and retry, or choose a theme to replace it.";

export function readTerminalTheme(): TerminalThemeId {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(terminalThemeFile(), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "default";
    throw new TerminalThemeProblem(unreadable);
  }
  if (
    typeof value !== "object" ||
    value === null ||
    !("theme" in value) ||
    !isTerminalThemeId(value.theme)
  )
    throw new TerminalThemeProblem(
      "The saved terminal theme is not one this dashboard knows. Choose a theme to replace it.",
    );
  return value.theme;
}

export function saveTerminalTheme(theme: TerminalThemeId): void {
  const file = terminalThemeFile();
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    replaceFile(file, `${JSON.stringify({ theme })}\n`);
  } catch {
    throw new TerminalThemeProblem(
      "The terminal theme could not be saved. Check the dashboard folder permissions and retry; the previous theme was kept.",
    );
  }
}
