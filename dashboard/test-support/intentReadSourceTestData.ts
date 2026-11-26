// A case's Intent reads (`../src/intentReadSource.ts`). The case supplies its
// locations, file and candidates reads; unless told, the whole project's tree
// at a revision answers the files of the locations the page has there (none
// for a project without configured locations): those the case's own locations
// read answered, or those the page already kept for that revision, without
// asking that read again. It stays unanswered until either is known. A
// project file reads as the case's file read answers that path.

import {
  keptIntentLocationsAt,
  type IntentLocations,
} from "../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../src/intentReadSource.ts";

type CaseReads = Pick<
  IntentReadSource,
  "readLocations" | "readFile" | "readCandidates"
> &
  Partial<Pick<IntentReadSource, "readProjectTree" | "readProjectFile">>;

export class IntentReadSourceBuilder {
  #reads: CaseReads | undefined;

  reading(reads: CaseReads) {
    this.#reads = reads;
    return this;
  }

  please(): IntentReadSource {
    const reads = this.#reads;
    if (reads === undefined) throw new Error("An Intent read source reads");
    const answered = new LocationFilesByRevision();
    return {
      readProjectTree: (...[source, revision, signal]) => {
        // The page keeps a locations answer across cases, so a case it
        // answers for does not ask the case's read again.
        const kept = keptIntentLocationsAt(source, revision);
        if (kept !== undefined) answered.note(revision, kept);
        return answered.treeAt(revision, signal);
      },
      readProjectFile: reads.readFile,
      ...reads,
      readLocations: (...args) => {
        const [, revision] = args;
        return reads.readLocations(...args).then((locations) => {
          answered.note(revision, locations);
          return locations;
        });
      },
    };
  }
}

// The location files each revision's locations read answered, and the tree
// reads waiting for them.
class LocationFilesByRevision {
  readonly #files = new Map<string, readonly string[]>();
  readonly #waiting = new Map<
    string,
    Array<(files: readonly string[]) => void>
  >();

  note(revision: string, locations: IntentLocations) {
    const files =
      locations.status === "configured"
        ? [
            ...new Set(
              locations.locations.flatMap((location) => location.files),
            ),
          ]
        : [];
    this.#files.set(revision, files);
    for (const answer of this.#waiting.get(revision) ?? []) answer(files);
    this.#waiting.delete(revision);
  }

  treeAt(revision: string, signal: AbortSignal) {
    const files = this.#files.get(revision);
    if (files !== undefined) return Promise.resolve(files);
    return new Promise<readonly string[]>((resolve, reject) => {
      this.#waiting.set(revision, [
        ...(this.#waiting.get(revision) ?? []),
        resolve,
      ]);
      signal.addEventListener("abort", () => {
        reject(new Error("The project tree read was aborted."));
      });
    });
  }
}
