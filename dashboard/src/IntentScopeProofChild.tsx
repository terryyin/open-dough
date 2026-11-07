// A Summary table child's name that opens that folder or file as the tree
// does (`./IntentScopeProof.tsx`).

import { ScopePath } from "./CiProofTable.tsx";
import type { SummaryChild } from "./ciScopeProof.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function ChildName({
  child,
  onOpen,
}: {
  readonly child: SummaryChild;
  readonly onOpen: (next: IntentSelection) => void;
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
    </button>
  );
}
