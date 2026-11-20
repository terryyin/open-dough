// The sole home of story notes: ~/.open-dough/dashboard/story-notes.json.
// An unreadable file is reported and preserved in place; it cannot be rebuilt.
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { z } from "zod";
import type { AttachedStoryNote } from "../src/followUpRequest.ts";
import {
  storyNoteChangeSchema,
  storyNoteIsWaiting,
  storyNoteSchema,
  storyNoteVersion,
  type StoryNote,
  type StoryNoteChange,
  type StoryNotesAnswer,
} from "../src/storyNote.ts";
import { configuredProject } from "./projectConfiguration.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { machineDashboardPath } from "./machineHome.ts";
import {
  leaveMachineJson,
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

// Waiting notes of one story for follow-up admission, or that the store
// could not be read.
export async function waitingStoryNotes(
  project: string,
  identity: string,
): Promise<"unreadable" | StoryNote[]> {
  const read = await readMachineJson(notesStore());
  if (read.kind === "unreadable") return "unreadable";
  return (read.document[project]?.[identity] ?? []).filter(storyNoteIsWaiting);
}

// Sets `delivered` on each note whose current version still equals the
// attached one (`./storyNoteDelivery.ts`). A newer edit is left waiting.
export async function deliverAttachedStoryNotes(
  project: string,
  identity: string,
  attached: readonly AttachedStoryNote[],
): Promise<void> {
  if (attached.length === 0) return;
  const versions = new Map(attached.map((note) => [note.id, note.version]));
  await replaceMachineJson(notesStore(), (stored) => {
    const projectNotes = stored[project];
    const notes = projectNotes?.[identity];
    if (projectNotes === undefined || notes === undefined)
      return leaveMachineJson;
    const next = notes.map((note) => {
      const version = versions.get(note.id);
      if (
        version === undefined ||
        storyNoteVersion(note) !== version ||
        note.delivered === version
      )
        return note;
      return { ...note, delivered: version };
    });
    if (next.every((note, index) => note === notes[index]))
      return leaveMachineJson;
    return {
      ...stored,
      [project]: { ...projectNotes, [identity]: next },
    };
  });
}

async function changeNotes(
  project: string,
  change: StoryNoteChange,
): Promise<StoryNotesAnswer> {
  let answer: StoryNotesAnswer = { kind: "notes", notes: {} };
  await replaceMachineJson(notesStore(), (stored) => {
    const notes = stored[project]?.[change.identity] ?? [];
    if (change.action !== "add" && !notes.some(({ id }) => id === change.id))
      throw new RefusedRequest(404, "The note no longer exists.");
    const changed =
      change.action === "add"
        ? [
            {
              id: randomUUID(),
              text: change.text,
              savedAt: new Date().toISOString(),
              ...(change.context === undefined
                ? {}
                : { context: change.context }),
            },
            ...notes,
          ]
        : change.action === "edit"
          ? notes.map((note) =>
              note.id === change.id
                ? {
                    ...note,
                    text: change.text,
                    editedAt: new Date().toISOString(),
                  }
                : note,
            )
          : notes.filter(({ id }) => id !== change.id);
    const next = {
      ...stored,
      [project]: { ...stored[project], [change.identity]: changed },
    };
    answer = answerOf(next, project);
    return next;
  });
  return answer;
}

// The typed notes handler: reads (no change) or changes one admitted project's
// notes and answers them. A change to a note that no longer exists is refused.
export async function storyNotes(
  project: string,
  change?: StoryNoteChange,
): Promise<StoryNotesAnswer> {
  if (change !== undefined) return changeNotes(project, change);
  const read = await readMachineJson(notesStore());
  return read.kind === "unreadable" ? read : answerOf(read.document, project);
}

// A notes request as the wire hands it over: its method, its URL and its
// body, read only for a change.
export interface StoryNotesRequest {
  readonly method: string | undefined;
  readonly url: URL;
  readonly body: () => Promise<unknown>;
}

// Admits a notes request: the method, the `?id=` project among the configured
// ones and the change body parsed against the shared schema.
export async function admittedStoryNotesRequest(
  { method, url, body }: StoryNotesRequest,
  isConfigured: (project: string) => boolean,
): Promise<{ project: string; change?: StoryNoteChange }> {
  if (method !== "GET" && method !== "POST")
    throw new RefusedRequest(405, "Only GET and POST are accepted.");
  const project = url.searchParams.get("id");
  if (project === null)
    throw new RefusedRequest(400, "The notes request names one project.");
  if (!isConfigured(project))
    throw new RefusedRequest(404, "The project is not configured.");
  if (method === "GET") return { project };
  const change = storyNoteChangeSchema.safeParse(await body());
  if (!change.success)
    throw new RefusedRequest(400, "The notes request is malformed.");
  return { project, change: change.data };
}

// The wire adapter: admits the request against the configured projects and
// answers it through the handler.
export async function answerStoryNotes(
  req: IncomingMessage,
  signal: AbortSignal,
): Promise<StoryNotesAnswer> {
  const { project, change } = await admittedStoryNotesRequest(
    {
      method: req.method,
      url: new URL(req.url ?? "", "http://local"),
      body: () => jsonBody(req, signal),
    },
    (id) => configuredProject(id) !== undefined,
  );
  signal.throwIfAborted();
  return storyNotes(project, change);
}
