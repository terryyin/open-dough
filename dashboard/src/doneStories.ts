// The done stories published beside the backlog at the snapshot's revision:
// each done record the local boundary lists there, as the shared done-record
// module under `src/skills/dough-product-backlog/scripts/` reads it, checked
// here for the fields this dashboard shows. Which records are still recent is
// that module's window too. A record the module refuses is reported by its
// file name and shows no story; a failed read is a gap, never an empty set.

import { z } from "zod";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  isWithinDoneWindow,
  parseDoneRecordFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { PublishedFile } from "./authenticatedGet.ts";
import { readDoneRecordsAt } from "./authenticatedDoneRead.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { detailGapProblem } from "./readWaitBound.ts";

const doneStory = z.object({
  identity: z.string().min(1),
  title: z.string().min(1),
  completedAt: z.iso.datetime(),
  developer: z.string().min(1).optional(),
  agent: z.string().min(1).optional(),
  host: z.enum(agentHosts).optional(),
});

const readRecord = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), record: doneStory }),
  z.object({ ok: z.literal(false), error: z.string().min(1) }),
]);

// One published done record's facts; the developer, agent, and host stay
// undefined when the record does not name them.
export type DoneStory = z.infer<typeof doneStory>;

// A published done record the shared reader could not read, by its file name.
export type UnreadableDoneRecord = {
  readonly file: string;
  readonly problem: string;
};

export type DoneStories =
  | { readonly status: "loading" }
  | { readonly status: "unavailable"; readonly problem: string }
  | {
      readonly status: "read";
      readonly stories: readonly DoneStory[];
      readonly unreadable: readonly UnreadableDoneRecord[];
    };

const doneUnreadProblem = "Done stories could not be read.";

// Reads the revision's done records; a failed or abandoned read, one still
// unanswered at the wait bound among them, is the column's gap, said with the
// reason when one is known.
export async function readDoneStories(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<DoneStories> {
  let records: readonly PublishedFile[];
  try {
    records = await readDoneRecordsAt(source, revision, signal);
  } catch (error) {
    const why = detailGapProblem(error, signal, "the done records", "");
    return {
      status: "unavailable",
      problem: `${doneUnreadProblem} ${why}`.trimEnd(),
    };
  }
  const stories: DoneStory[] = [];
  const unreadable: UnreadableDoneRecord[] = [];
  for (const { path, text } of records) {
    const file = path.split("/").pop() ?? path;
    const read = readRecord.safeParse(parseDoneRecordFile(file, text));
    if (!read.success) {
      unreadable.push({
        file,
        problem:
          "the shared done-record reader answered in a shape this dashboard does not understand",
      });
    } else if (read.data.ok) {
      stories.push(read.data.record);
    } else {
      unreadable.push({ file, problem: read.data.error });
    }
  }
  return { status: "read", stories, unreadable };
}

// The done stories still recent at `now`, by the shared window.
export function recentDoneStories(
  done: DoneStories | undefined,
  now: Date,
): readonly DoneStory[] {
  return done?.status === "read"
    ? done.stories.filter((story) => isWithinDoneWindow(story.completedAt, now))
    : [];
}
