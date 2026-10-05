// A control that asks first, in place, before its action, shared by the
// record actions of session entries (`./sessionRecordActions.tsx`) and the
// side panel's Mark as done (`./TerminalPanel.tsx`,
// `./SessionResultPanel.tsx`).
import { useEffect, useId, useRef, useState } from "react";
import { useFrameDescription } from "./protectedFrame.ts";
import "./agent-launch.css";

// What an action asked from a control came to: settled (the entry leaves or
// changes, so nothing moves), asked again with the keyboard on the answer that
// was pressed, withdrawn without moving the keyboard, or returned to the
// control with the keyboard on it.
type Answered = "settled" | "retry" | "withdrawn" | "returned";

type Act = (control: HTMLElement) => Promise<Answered>;

// One control's asking, wherever its question shows: while there is a
// question, pressing the control asks it, with the keyboard on the keeping
// answer. Keeping, or Escape, ends the asking with the keyboard back on the
// control. Confirming acts and disables both answers until the action
// answers. A question that no longer applies ends the asking, and the control
// acts at once. Without a question, the control acts at once.
export function useAskInPlace(question: string | undefined, act: Act) {
  const [step, setStep] = useState<"idle" | "asking" | "acting">("idle");
  const control = useRef<HTMLButtonElement>(null);
  const keeping = useRef<HTMLButtonElement>(null);
  const restoring = useRef(false);
  const retrying = useRef<HTMLElement | null>(null);
  const asks = question !== undefined;

  useEffect(() => {
    if (step === "asking") {
      // After a failed action the keyboard stays on the button it was on.
      (retrying.current ?? keeping.current)?.focus();
      retrying.current = null;
    }
    if (step === "idle" && restoring.current) {
      restoring.current = false;
      control.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (!asks) setStep((current) => (current === "acting" ? current : "idle"));
  }, [asks]);

  const keepAsIs = () => {
    restoring.current = true;
    setStep("idle");
  };
  const follow = (answered: Answered, pressed: HTMLElement) => {
    if (answered === "settled") return;
    if (answered === "retry") retrying.current = pressed;
    if (answered === "returned") restoring.current = true;
    setStep(answered === "retry" ? "asking" : "idle");
  };
  return {
    question,
    step,
    // Whether the question shows instead of, or beside, the control.
    shown: step !== "idle",
    // The control, which gets the keyboard back.
    control,
    keeping,
    press: (pressed: HTMLElement) => {
      if (asks) setStep("asking");
      else void act(pressed);
    },
    confirm: (pressed: HTMLElement) => {
      setStep("acting");
      void act(pressed).then((answered) => {
        follow(answered, pressed);
      });
    },
    keepAsIs,
  };
}

// The question of a control's asking (`useAskInPlace`), as a group labelled
// by its words, offering the confirming and the keeping answers; `placed`
// styles it where it shows.
export function InPlaceQuestion({
  asking,
  confirm,
  keep,
  placed,
}: {
  readonly asking: ReturnType<typeof useAskInPlace>;
  readonly confirm: string;
  readonly keep: string;
  readonly placed?: string;
}) {
  const described = useFrameDescription();
  const words = useId();
  const { step } = asking;
  return (
    <div
      role="group"
      aria-labelledby={words}
      className={`launch-open in-place-question ${placed ?? ""}`.trim()}
      onKeyDown={(event) => {
        if (event.key === "Escape" && step === "asking") {
          event.stopPropagation();
          asking.keepAsIs();
        }
      }}
    >
      <p id={words}>{asking.question}</p>
      <p className="in-place-question-actions">
        <button
          type="button"
          aria-describedby={described}
          disabled={step === "acting"}
          onClick={(event) => {
            asking.confirm(event.currentTarget);
          }}
        >
          {confirm}
        </button>
        <button
          ref={asking.keeping}
          type="button"
          aria-describedby={described}
          disabled={step === "acting"}
          onClick={asking.keepAsIs}
        >
          {keep}
        </button>
      </p>
    </div>
  );
}

// A control whose question replaces it while asked (`useAskInPlace`).
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
  readonly act: Act;
}) {
  const asking = useAskInPlace(question, act);
  const described = useFrameDescription();
  if (asking.shown)
    return <InPlaceQuestion asking={asking} confirm={confirm} keep={keep} />;
  return (
    <p className="launch-open">
      <button
        ref={asking.control}
        type="button"
        aria-describedby={described}
        disabled={disabled}
        onClick={(event) => {
          onPress();
          asking.press(event.currentTarget);
        }}
      >
        {label}
      </button>
    </p>
  );
}
