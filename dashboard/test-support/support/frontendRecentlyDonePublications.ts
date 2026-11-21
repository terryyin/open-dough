// Per-source Recently done substitute publications: done catalogs/bodies and
// published-session listings (listed sessions, or an HTTP refusal the page
// shows as its own gap).

import type { PublishedSessionRecord } from "../../src/publishedSessionRecord.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { describedRevisions } from "../describedRevisions.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";

// Per-source done catalog and record bodies for Recently done selection.
export type FrontendDonePublication = {
  // Catalog JSON text, a gap string, or an HTTP refusal.
  readonly catalog?:
    | string
    | { readonly gap: string }
    | { readonly status: number; readonly error: string };
  // Done record file name → published text.
  readonly bodies?: Readonly<Record<string, string>>;
};

// Per-source published-session listing for Recently done: listed sessions, or
// an HTTP refusal that the page shows as its own gap.
export type FrontendPublishedSessionsPublication =
  | { readonly sessions: readonly PublishedSessionRecord[] }
  | { readonly status: number; readonly error: string };

// Arranges the done catalog and bodies one source's authenticated reads answer.
export function putFrontendDonePublication(
  services: FrontendServiceState,
  sourceId: string,
  done: FrontendDonePublication,
): void {
  Object.assign(services, {
    doneBySource: { ...services.doneBySource, [sourceId]: done },
  });
}

// Arranges one source's published-session listing answer.
export function putFrontendPublishedSessions(
  services: FrontendServiceState,
  sourceId: string,
  published: FrontendPublishedSessionsPublication,
): void {
  Object.assign(services, {
    publishedSessionsBySource: {
      ...services.publishedSessionsBySource,
      [sourceId]: published,
    },
  });
}

// Publishes readable done records for one source from their builder values.
export function putFrontendDoneRecords(
  services: FrontendServiceState,
  sourceId: string,
  records: readonly ReturnType<
    ReturnType<typeof makeMe.aDoneRecord.with>["please"]
  >[],
): void {
  const { done } = describedRevisions(
    makeMe.aRepository
      .withRevision("done", { doneRecords: [...records] })
      .please(),
    { done: services.revision },
  );
  const catalog = done.files[".planning/done/.catalog.json"];
  if (catalog === undefined) {
    throw new Error(`Expected ${sourceId} done catalog.`);
  }
  const bodies: Record<string, string> = {};
  for (const record of records) {
    const fileName = doneRecordFileName(record.identity);
    const body = done.files[`.planning/done/${fileName}`];
    if (body === undefined) throw new Error(`Missing done body ${fileName}`);
    bodies[fileName] = body;
  }
  putFrontendDonePublication(services, sourceId, { catalog, bodies });
}
