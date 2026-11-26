// A case's Intent reads (`../src/intentReadSource.ts`). The case supplies its
// locations, file and candidates reads; unless told, the whole project's tree
// stays unanswered, so the browser lists its configured location files and the
// case's location reads are not asked again, and a project file reads as the
// case's file read answers that path.

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
    return {
      readProjectTree: (...[, , signal]) =>
        new Promise<readonly string[]>((...[, reject]) => {
          signal.addEventListener("abort", () => {
            reject(new Error("The project tree read was aborted."));
          });
        }),
      readProjectFile: reads.readFile,
      ...reads,
    };
  }
}
