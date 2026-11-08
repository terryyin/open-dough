// Model listings the fake `cursor-agent models` prints (./fakeCursor.ts), in
// the observed layout.
import { rmSync, writeFileSync } from "node:fs";

export type CursorModelListing =
  readonly { readonly model: string; readonly name: string }[] | undefined;

// The second name ends with U+200B, as some observed names do.
export const cursorModels = [
  { model: "auto", name: "Auto (default)" },
  { model: "gpt-5.2", name: "GPT-5.2​" },
] as const;

// Multi-effort family for dialog and composed `--model` proof. No bare base
// id is listed, so an explicit effort is required. Fast is a distinct choice.
export const cursorEffortModels = [
  { model: "fixture-orb-low", name: "Fixture Orb Low" },
  { model: "fixture-orb-high", name: "Fixture Orb High" },
  { model: "fixture-orb-high-fast", name: "Fixture Orb High Fast" },
] as const;

// A second family that lists a different effort set, for incompatible switch.
export const cursorOtherEffortModels = [
  { model: "fixture-luna-medium", name: "Fixture Luna Medium" },
] as const;

// Undefined removes the listing, so `models` exits nonzero.
export function writeCursorModelListing(
  file: string,
  models: CursorModelListing,
): void {
  if (models === undefined) {
    rmSync(file, { force: true });
    return;
  }
  writeFileSync(
    file,
    [
      "Available models",
      "",
      ...models.map(({ model, name }) => `${model} - ${name}`),
      "",
      "Tip: a fixture line - not a model",
      "",
    ].join("\n"),
  );
}
