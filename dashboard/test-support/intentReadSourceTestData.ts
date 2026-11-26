// A case's Intent reads (`../src/intentReadSource.ts`). The case supplies its
// locations, file and candidates reads; unless told, the whole project's tree
// is the files its configured locations list at that revision, and a project
// file reads as the case's file read answers that path.

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
      readProjectTree: async (source, revision, signal) => {
        const answer = await reads.readLocations(source, revision, signal);
        return answer.status === "configured"
          ? answer.locations.flatMap(({ files }) => files)
          : [];
      },
      readProjectFile: reads.readFile,
      ...reads,
    };
  }
}
