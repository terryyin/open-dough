// The syntax-styling choice in System settings, kept in one file under this
// machine's home so Intent and story-review diffs share it. Read afresh for
// every use and replaced atomically; it is not a secret.
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  isSyntaxStylingId,
  type SyntaxStylingId,
} from "../src/syntaxStylingChoices.ts";
import { replaceFile } from "./fileReplacement.ts";
import { machineDashboardPath } from "./machineHome.ts";

export class SyntaxStylingProblem extends Error {}

function syntaxStylingFile(): string {
  return machineDashboardPath("syntax-styling.json");
}

const unreadable =
  "The saved syntax styling could not be read. Check its file permissions and retry, or choose a setting to replace it.";

export function readSyntaxStyling(): SyntaxStylingId {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(syntaxStylingFile(), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "default";
    throw new SyntaxStylingProblem(unreadable);
  }
  if (
    typeof value !== "object" ||
    value === null ||
    !("styling" in value) ||
    !isSyntaxStylingId(value.styling)
  )
    throw new SyntaxStylingProblem(
      "The saved syntax styling is not one this dashboard knows. Choose a setting to replace it.",
    );
  return value.styling;
}

export function saveSyntaxStyling(styling: SyntaxStylingId): void {
  const file = syntaxStylingFile();
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    replaceFile(file, `${JSON.stringify({ styling })}\n`);
  } catch {
    throw new SyntaxStylingProblem(
      "The syntax styling could not be saved. Check the dashboard folder permissions and retry; the previous setting was kept.",
    );
  }
}
