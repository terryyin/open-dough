// What one published done record says, as the shared done-record module
// under `src/skills/dough-product-backlog/scripts/` reads it, checked here for
// the fields this dashboard shows: Recently done's cards
// (`./doneStories.ts`) and a done story's follow-up context, which the
// server reads at the revision the page showed
// (`../server/followUpStory.ts`).

import { z } from "zod";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { parseDoneRecordFile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

const doneStory = z.object({
  identity: z.string().min(1),
  title: z.string().min(1),
  completedAt: z.iso.datetime(),
  developer: z.string().min(1).optional(),
  agent: z.string().min(1).optional(),
  host: z.enum(agentHosts).optional(),
  intentCoverage: z
    .union([
      z.object({ report: z.string() }),
      z.object({ unavailable: z.string() }),
    ])
    .optional(),
});

const readRecord = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), record: doneStory }),
  z.object({ ok: z.literal(false), error: z.string().min(1) }),
]);

// One published done record's facts; the developer, agent, and host stay
// undefined when the record does not name them.
export type DoneStory = z.infer<typeof doneStory>;

// What one done record's text says: its story, or why the shared reader
// refused it.
export type DoneRecordRead =
  | { readonly status: "read"; readonly story: DoneStory }
  | { readonly status: "unreadable"; readonly problem: string };

// How a done record the shared reader refused is named wherever it shows.
export const unreadableDoneRecord = (file: string, problem: string) =>
  `Done record ${file} is unreadable: ${problem}.`;

export function doneRecordOf(file: string, text: string): DoneRecordRead {
  const read = readRecord.safeParse(parseDoneRecordFile(file, text));
  if (!read.success) {
    return {
      status: "unreadable",
      problem:
        "the shared done-record reader answered in a shape this dashboard does not understand",
    };
  }
  return read.data.ok
    ? { status: "read", story: read.data.record }
    : { status: "unreadable", problem: read.data.error };
}
