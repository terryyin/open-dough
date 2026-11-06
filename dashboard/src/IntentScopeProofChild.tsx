// A Summary table child's name that opens that folder or file as the tree
// does (`./IntentScopeProof.tsx`), optionally marking a story change kind.

import { ScopePath } from "./CiProofTable.tsx";
import type { SummaryChild } from "./ciScopeProof.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { ChangeKind } from "./reviewFileTree.ts";

export const changeKindWords: Record<ChangeKind, string> = {
  added: "added",
  modified: "modified",
  deleted: "removed",
  renamed: "renamed",
};

export function ChildName({
  child,
  onOpen,
  marker,
}: {
  readonly child: SummaryChild;
  readonly onOpen: (next: IntentSelection) => void;
  readonly marker?: ChangeKind;
}) {
  return (
    <button
      type="button"
      className="intent-open-link"
      onClick={() => {
        onOpen({ path: child.path, scope: child.kind });
      }}
    >
      <ScopePath
        path={child.kind === "folder" ? `${child.name}/` : child.name}
      />
      {marker !== undefined ? ` ${changeKindWords[marker]}` : ""}
    </button>
  );
}
