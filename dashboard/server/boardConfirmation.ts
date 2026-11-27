// The Board check's commit point: the revision origin last confirmed for a
// branch and when, recorded beside the Review repository's sync record. Git
// may hold a later candidate's objects and Board ref; only this record says
// what a reader answers. It is replaced durably and whole, so a failed write
// leaves the former confirmation readable.
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { commitIdSchema } from "../src/launchLanding.ts";
import { replaceDurableJson } from "./durableJsonReplacement.ts";

export type BoardConfirmation = {
  readonly revision: string;
  readonly confirmedAt: string;
};

const recordSchema = z.object({
  ref: z.string(),
  revision: commitIdSchema,
  confirmedAt: z.string(),
});

const recordPath = (repository: string) =>
  path.join(repository, "open-dough-board-confirmation.json");

// The confirmation recorded for `branch`, if any. A record of another
// branch, or one that cannot be read, confirms nothing.
export async function boardConfirmation(
  repository: string,
  branch: string,
): Promise<BoardConfirmation | undefined> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(recordPath(repository), "utf8"));
  } catch {
    return undefined;
  }
  const recorded = recordSchema.safeParse(parsed);
  if (!recorded.success || recorded.data.ref !== branch) return undefined;
  const { revision, confirmedAt } = recorded.data;
  return { revision, confirmedAt };
}

// Callers share one check per branch, so one temporary path is enough.
export async function recordBoardConfirmation(
  repository: string,
  branch: string,
  confirmation: BoardConfirmation,
): Promise<void> {
  const file = recordPath(repository);
  const temporary = `${file}.tmp`;
  try {
    await replaceDurableJson(
      temporary,
      file,
      JSON.stringify({ ref: branch, ...confirmation }),
    );
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}
