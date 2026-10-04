// The Cursor runner's request and result shapes. The dashboard client and the
// runner process both use this module, so each field has one definition.
import { z } from "zod";
import { cursorHeldLabelSchema } from "../../../src/cursorHeldLabel.ts";
import { hostSessionSchema } from "../../../src/hostSession.ts";

export const cursorRunnerExecRequest = z.object({
  args: z.array(z.string()),
  cwd: z.string().optional(),
});

export const cursorRunnerExecResult = z.object({
  failed: z.boolean(),
  errorCode: z.string().optional(),
  stdout: z.string(),
  stderr: z.string(),
});

export type CursorRunnerExec = z.infer<typeof cursorRunnerExecResult>;

export const cursorRunnerKeepRequest = z.object({
  command: z.string().min(1),
  args: z.array(z.string()),
  cwd: z.string().min(1),
  cols: z.int().positive(),
  rows: z.int().positive(),
  sourceId: z.string().min(1),
  session: hostSessionSchema,
  instruction: z.string(),
  // The page opens a terminal for this launch. The follow-up prompt keeps
  // that process.
  handoff: z.boolean().optional(),
});

export type CursorRunnerKeepRequest = z.infer<typeof cursorRunnerKeepRequest>;

export const cursorRunnerKeepResult = z.object({
  kind: z.enum(["kept", "missing", "failed"]),
});

// One read of the clients this runner holds. It starts nothing.
export const cursorRunnerSessionsResult = z.object({
  sessions: z.array(
    z.object({
      session: hostSessionSchema,
      label: cursorHeldLabelSchema,
    }),
  ),
});

export type CursorRunnerSessionsResult = z.infer<
  typeof cursorRunnerSessionsResult
>;

// The admitted terminal session, carried on the attach query. The runner
// accepts it only when the session host is Cursor.
export const cursorRunnerAttachSession = z.object({
  sourceId: z.string().min(1),
  session: hostSessionSchema,
  markedDone: z.boolean(),
  folder: z.object({
    path: z.string().min(1),
    shown: z.string().min(1),
  }),
});
