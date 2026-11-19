// Public selection catalog output of compareAgentEffort.ts.
import type { UsageTask } from "./usageRecords.ts";

export type NativeCatalogEntry = Pick<
  UsageTask,
  "id" | "host" | "sessionId" | "rootTurnId" | "identity" | "launchedAt"
>;
export type CursorCatalogEntry = {
  host: "cursor";
  id: string;
  root: string;
  directory: string;
};
export type SelectionCatalog = {
  format: "agent-effort-v1";
  selections: (NativeCatalogEntry | CursorCatalogEntry)[];
};

export const nativeCatalogEntry = (
  task: NativeCatalogEntry,
): NativeCatalogEntry => ({
  id: task.id,
  host: task.host,
  sessionId: task.sessionId,
  rootTurnId: task.rootTurnId,
  identity: task.identity,
  launchedAt: task.launchedAt,
});
export const cursorCatalogEntry = (
  entry: CursorCatalogEntry,
): CursorCatalogEntry => ({
  host: entry.host,
  id: entry.id,
  root: entry.root,
  directory: entry.directory,
});
export function catalogOutput(
  catalog: Pick<SelectionCatalog, "selections">,
): SelectionCatalog {
  return {
    format: "agent-effort-v1",
    selections: catalog.selections.map((entry) =>
      "directory" in entry
        ? cursorCatalogEntry(entry)
        : nativeCatalogEntry(entry),
    ),
  };
}
export const renderCatalog = (catalog: Pick<SelectionCatalog, "selections">) =>
  JSON.stringify(catalogOutput(catalog).selections, null, 2);
