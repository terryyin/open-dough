// Shared support for ../authenticated-read-done-catalog.spec.ts,
// ../authenticated-read-done-catalog-gaps.spec.ts, and
// ../authenticated-read-done-catalog-refusal.spec.ts: done records as
// completion renders them, the catalog the shared module reads from them
// (../doneCatalogAnswers.ts), and how a test sends done catalog and record
// reads to the boundary and observes the questions that reached GitHub.

import type { DashboardServer } from "./dashboardServer.ts";
import { rawRequest } from "./rawHttp.ts";
import { askedSince } from "./sharedReads.ts";
import { doneCatalogOf } from "../doneCatalogAnswers.ts";
import {
  doneCatalogFileName,
  parseDoneCatalog,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

// Each test publishes its own revisions: the boundary remembers what it read
// for as long as the server runs.
export const revisionOf = (pair: string) => pair.repeat(20);
export const doneDirectory = ".planning/done";
export const catalogPath = `${doneDirectory}/${doneCatalogFileName}`;

export const identityOf = (label: string, index: number) =>
  `SEED-${String(index + 100)}#${label}-${String(index)}`;
export const fileOf = (identity: string) =>
  doneRecordPath(identity).split("/").pop() ?? identity;
export const pathOf = (identity: string) =>
  `.planning/${doneRecordPath(identity)}`;

// `count` done records completed an hour apart, each as completion renders
// it, with a file beside them that is no record.
export function doneRecords(
  label: string,
  count: number,
): Readonly<Record<string, string>> {
  return Object.fromEntries([
    ...[...Array(count).keys()].map((index): [string, string] => {
      const identity = identityOf(label, index);
      return [
        pathOf(identity),
        renderDoneRecord({
          identity,
          title: `Finish ${label} ${String(index)}`,
          completedAt: new Date(
            Date.UTC(2026, 9, 1, index, 0, 0),
          ).toISOString(),
          developer: "Terry Yin",
        }),
      ];
    }),
    [`${doneDirectory}/README.md`, "Not a done record.\n"],
  ]);
}

// The catalog of `files`, as the shared module reads it.
export function catalogOf(files: Readonly<Record<string, string>>) {
  const read = parseDoneCatalog(doneCatalogOf(files, doneDirectory));
  if (!read.ok) throw new Error(read.error);
  return read.catalog;
}

export const answerOf = (response: { body: string }) =>
  JSON.parse(response.body) as Record<string, unknown>;

// The done reads a test sends to the server `serverOf` answers once it has
// started, and the questions that reached GitHub since a count of its calls.
export function doneCatalogReads(serverOf: () => DashboardServer) {
  const readAt = (revision: string, query: string, source = "open-dough") =>
    rawRequest({
      url: `${serverOf().baseURL}/__authenticated-read?source=${source}&revision=${revision}&${query}`,
      headers: { Origin: serverOf().origin },
    });
  const asked = (before: number) => askedSince(serverOf(), before);
  return {
    readAt,
    catalogAt: (revision: string, source?: string) =>
      readAt(revision, "done=catalog", source),
    bodiesAt: (revision: string, files: readonly string[]) =>
      readAt(
        revision,
        `done=bodies${files.map((file) => `&file=${encodeURIComponent(file)}`).join("")}`,
      ),
    asked,
    // The content reads that reached GitHub since `before`.
    contentAsked: (before: number) =>
      asked(before).filter((question) => question.startsWith("content ")),
  };
}
