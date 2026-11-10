// The selected Summary's existing evidence and independently read history.
import { IntentSummaryView } from "./IntentSummaryView.tsx";
import { IntentScopeProof } from "./IntentScopeProof.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentSummary({
  revision,
  onOpen,
  treeFiles,
  ...props
}: Omit<Parameters<typeof IntentSummaryView>[0], "children"> & {
  readonly revision: string;
  // The story overlay's files, used by the Summary's proof comparison.
  readonly treeFiles: ReadonlyMap<string, IntentTreeFile>;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  return (
    <IntentSummaryView {...props}>
      <IntentScopeProof
        path={props.path}
        inventory={props.files}
        treeFiles={treeFiles}
        revision={revision}
        onOpen={onOpen}
      />
    </IntentSummaryView>
  );
}
