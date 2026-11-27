// The review details: the eye that reveals them and the disclosure that holds
// the comparison choices and context.
import { useRef, useState, type ReactNode, type Ref } from "react";
import { Eye, EyeOff } from "lucide-react";
import { IconButton } from "./Icon.tsx";

// The review details as the review places them: the section's id, whether
// the developer reveals them, and the eye that takes the keyboard back.
export type ReviewDetailsPlace = {
  readonly id: string;
  readonly shown: boolean;
  readonly eye: Ref<HTMLButtonElement>;
  readonly onShow: (shown: boolean, focusEye?: boolean) => void;
};

// The review details' place under the given id: collapsed at first, and
// hiding them on request returns the keyboard to their eye.
export function useReviewDetailsPlace(id: string): ReviewDetailsPlace {
  const [shown, setShown] = useState(false);
  const eye = useRef<HTMLButtonElement>(null);
  return {
    id,
    shown,
    eye,
    onShow: (show, focusEye = false) => {
      setShown(show);
      if (focusEye) eye.current?.focus();
    },
  };
}

// The details the eye reveals: the comparison choices and context. Escape from
// inside hides them and returns the keyboard to the eye.
export function ReviewDetails({
  details,
  children,
}: {
  readonly details: ReviewDetailsPlace;
  readonly children: ReactNode;
}) {
  return (
    <div
      id={details.id}
      className="story-review-details"
      role="group"
      aria-label="Review details"
      hidden={!details.shown}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        details.onShow(false, true);
      }}
    >
      {children}
    </div>
  );
}

// The eye that reveals or hides the review details it controls.
export function ReviewDetailsEye({
  details,
}: {
  readonly details: ReviewDetailsPlace;
}) {
  return (
    <IconButton
      ref={details.eye}
      label={details.shown ? "Hide review details" : "Show review details"}
      icon={details.shown ? EyeOff : Eye}
      aria-controls={details.id}
      aria-expanded={details.shown}
      onClick={() => {
        details.onShow(!details.shown);
      }}
    />
  );
}
