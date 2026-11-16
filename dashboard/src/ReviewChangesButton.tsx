// Review changes control: GitCompare, the words, and an arrow toward the
// panel, drawn as start-launch-button. Eligibility and the reviewed-work
// subject stay with the caller (`./StoryReviewAction.tsx`,
// `./AdHocSessionReviewAction.tsx`).

import type { MouseEventHandler } from "react";
import { ArrowRight, GitCompare } from "lucide-react";
import { Icon } from "./Icon.tsx";

export function ReviewChangesButton({
  onClick,
}: {
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div>
      <button type="button" className="start-launch-button" onClick={onClick}>
        <Icon icon={GitCompare} />
        Review changes
        <Icon icon={ArrowRight} />
      </button>
    </div>
  );
}
