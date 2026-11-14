// Canonical published completion facts shared by acquisition proofs. Each
// case materializes its own resources and keeps actions/evidence local.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  endpointPrefix,
  endpointIdentity,
  endpointAuthor,
  endpointProfilePath,
} from "./comparisonEndpointPrefix.ts";

const done = makeMe.aDoneRecord
  .completed({
    identity: endpointIdentity,
    completedAt: "2026-11-09T00:00:00.000Z",
  })
  .please();
export const historyFacts = endpointPrefix
  .withRevision("done", {
    author: endpointAuthor,
    doneRecords: [done],
    remove: [endpointProfilePath],
  })
  .withRevision("trunk", {
    parents: ["claim"],
    files: { "other.txt": "other\n" },
  })
  .withRevision("landing", {
    parents: ["trunk", "done"],
    author: endpointAuthor,
    doneRecords: [done],
    remove: [endpointProfilePath],
  })
  .please();
export const historySource = makeMe.aPublishedSource
  .with({ id: "history", label: "History", repository: "owner/history" })
  .please();
