// The sole home of story notes: ~/.open-dough/dashboard/story-notes.json.
// An unreadable file is reported and preserved in place; it cannot be rebuilt.
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { z } from "zod";
import {
  storyNoteChangeSchema,
  storyNoteSchema,
  type StoryNoteChange,
  type StoryNotesAnswer,
} from "../src/storyNote.ts";
import { configuredProject } from "./projectConfiguration.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { machineDashboardPath } from "./machineHome.ts";
import {
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";

const storedNotesSchema = z.record(
  z.string(),
  z.record(z.string(), z.array(storyNoteSchema)),
);
type StoredNotes = z.infer<typeof storedNotesSchema>;
const notesStore = (): MachineJsonStore<StoredNotes> => ({
  file: machineDashboardPath("story-notes.json"),
  schema: storedNotesSchema,
  empty: {},
  unreadable: "preserve",
  durable: true,
});
const answerOf = (stored: StoredNotes, project: string): StoryNotesAnswer => ({
  kind: "notes",
  notes: stored[project] ?? {},
});

async function changeNotes(
  project: string,
  change: StoryNoteChange,
): Promise<StoryNotesAnswer> {
  let answer: StoryNotesAnswer = { kind: "notes", notes: {} };
  await replaceMachineJson(notesStore(), (stored) => {
    const note = {
      id: randomUUID(),
      text: change.text,
      savedAt: new Date().toISOString(),
      ...(change.context === undefined ? {} : { context: change.context }),
    };
    const next = {
      ...stored,
      [project]: {
        ...stored[project],
        [change.identity]: [
          note,
          ...(stored[project]?.[change.identity] ?? []),
        ],
      },
    };
    answer = answerOf(next, project);
    return next;
  });
  return answer;
}

export async function answerStoryNotes(
  req: IncomingMessage,
  signal: AbortSignal,
): Promise<StoryNotesAnswer> {
  if (req.method !== "GET" && req.method !== "POST")
    throw new RefusedRequest(405, "Only GET and POST are accepted.");
  const project = new URL(req.url ?? "", "http://local").searchParams.get("id");
  if (project === null)
    throw new RefusedRequest(400, "The notes request names one project.");
  if (configuredProject(project) === undefined)
    throw new RefusedRequest(404, "The project is not configured.");
  if (req.method === "GET") {
    const read = await readMachineJson(notesStore());
    return read.kind === "unreadable" ? read : answerOf(read.document, project);
  }
  const change = storyNoteChangeSchema.safeParse(await jsonBody(req, signal));
  if (!change.success)
    throw new RefusedRequest(400, "The notes request is malformed.");
  signal.throwIfAborted();
  return changeNotes(project, change.data);
}
