// Review changes control: GitCompare, the words, and an arrow toward the
// panel, drawn as start-launch-button. Eligibility and the reviewed-work
// subject stay with the caller (`./StoryReviewAction.tsx`,
// `./PublishedSessionEntry.tsx`).

import type { MouseEventHandler } from "react";
import { ArrowRight, GitCompare } from "lucide-react";
import { Icon } from "./Icon.tsx";

export function ReviewChangesButton({
  onClick,
  label = "Review changes",
}: {
  readonly label?: string;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div>
      <button type="button" className="start-launch-button" onClick={onClick}>
        <Icon icon={GitCompare} />
        {label}
        <Icon icon={ArrowRight} />
      </button>
    </div>
  );
}
