// A control that asks first, in place, before its action, shared by the
// record actions of session entries (`./sessionRecordActions.tsx`).
import { useEffect, useId, useRef, useState } from "react";
import { useFrameDescription } from "./protectedFrame.ts";

// What an action asked from a control came to: settled (the entry leaves or
// changes, so nothing moves), asked again with the keyboard on the answer that
// was pressed, withdrawn without moving the keyboard, or returned to the
// control with the keyboard on it.
type Answered = "settled" | "retry" | "withdrawn" | "returned";

// A control whose action asks first, in place, while there is a question: the
// question replaces the control, as a group labelled by its words, with the
// keyboard on the keeping answer. Keeping, or Escape, puts the control back
// with the keyboard on it. Confirming acts and disables both answers until
// the action answers. A question that no longer applies goes away, and the
// control acts at once. Without a question, the control acts at once.
export function AskInPlace({
  label,
  disabled = false,
  question,
  confirm,
  keep,
  onPress,
  act,
}: {
  readonly label: string;
  readonly disabled?: boolean;
  readonly question: string | undefined;
  readonly confirm: string;
  readonly keep: string;
  // Called whenever the control is pressed, before it asks or acts.
  readonly onPress: () => void;
  readonly act: (control: HTMLElement) => Promise<Answered>;
}) {
  const [step, setStep] = useState<"idle" | "asking" | "acting">("idle");
  const button = useRef<HTMLButtonElement>(null);
  const keeping = useRef<HTMLButtonElement>(null);
  const restoring = useRef(false);
  const retrying = useRef<HTMLElement | null>(null);
  const described = useFrameDescription();
  const words = useId();
  const asks = question !== undefined;

  useEffect(() => {
    if (step === "asking") {
      // After a failed action the keyboard stays on the button it was on.
      (retrying.current ?? keeping.current)?.focus();
      retrying.current = null;
    }
    if (step === "idle" && restoring.current) {
      restoring.current = false;
      button.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (!asks) setStep((current) => (current === "acting" ? current : "idle"));
  }, [asks]);

  const keepAsIs = () => {
    restoring.current = true;
    setStep("idle");
  };
  const follow = (answered: Answered, control: HTMLElement) => {
    if (answered === "settled") return;
    if (answered === "retry") retrying.current = control;
    if (answered === "returned") restoring.current = true;
    setStep(answered === "retry" ? "asking" : "idle");
  };

  if (step === "idle") {
    return (
      <p className="launch-open">
        <button
          ref={button}
          type="button"
          aria-describedby={described}
          disabled={disabled}
          onClick={(event) => {
            onPress();
            if (asks) setStep("asking");
            else void act(event.currentTarget);
          }}
        >
          {label}
        </button>
      </p>
    );
  }
  return (
    <div
      role="group"
      aria-labelledby={words}
      className="launch-open in-place-question"
      onKeyDown={(event) => {
        if (event.key === "Escape" && step === "asking") {
          event.stopPropagation();
          keepAsIs();
        }
      }}
    >
      <p id={words}>{question}</p>
      <p className="in-place-question-actions">
        <button
          type="button"
          aria-describedby={described}
          disabled={step === "acting"}
          onClick={(event) => {
            const control = event.currentTarget;
            setStep("acting");
            void act(control).then((answered) => {
              follow(answered, control);
            });
          }}
        >
          {confirm}
        </button>
        <button
          ref={keeping}
          type="button"
          aria-describedby={described}
          disabled={step === "acting"}
          onClick={keepAsIs}
        >
          {keep}
        </button>
      </p>
    </div>
  );
}
