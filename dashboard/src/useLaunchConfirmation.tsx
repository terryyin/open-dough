// A launch dialog's pre-start confirmation state: Start submits until the
// boundary answers a confirmation (existing changes, base CI, or an
// unconfirmed stop), which replaces the choices until Back, Escape, or
// Continue resends with that confirmation. Accepted starts end the dialog.
// While submitted, cancel and Escape do not dismiss.

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";
import type {
  BaseCiFound,
  ExistingChangesFound,
  LaunchChoices,
  SessionPolicy,
} from "./agentLaunch.ts";
import type { StopUnconfirmedFound } from "./sessionStop.ts";
import { LaunchBaseCi } from "./LaunchBaseCi.tsx";
import { LaunchExistingChanges } from "./LaunchExistingChanges.tsx";
import { LaunchStopUnconfirmed } from "./LaunchStopUnconfirmed.tsx";

// What asking for a launch answers its dialog: whether the local service
// accepted it (its startup goes on without the dialog), or a confirmation
// with nothing started.
export type StartAnswer =
  boolean | ExistingChangesFound | BaseCiFound | StopUnconfirmedFound;

export function useLaunchConfirmation({
  id,
  landing,
  onStart,
  ended,
}: {
  readonly id: string;
  readonly landing: SessionPolicy["landing"];
  readonly onStart: (choices: LaunchChoices) => Promise<StartAnswer>;
  readonly ended: (accepted: boolean) => void;
}): {
  readonly view: ReactNode;
  readonly startButton: RefObject<HTMLButtonElement | null>;
  readonly submitting: boolean;
  readonly start: (choices: LaunchChoices) => void;
  readonly onCancel: (event: SyntheticEvent) => void;
} {
  const [found, setFound] = useState<ExistingChangesFound>();
  const [baseCi, setBaseCi] = useState<BaseCiFound>();
  const [blocked, setBlocked] = useState<StopUnconfirmedFound>();
  const [submitting, setSubmitting] = useState(false);
  // Set at once, so a second Start before the next render sends nothing.
  const submitted = useRef(false);
  const asked = useRef<LaunchChoices>(undefined);
  const startButton = useRef<HTMLButtonElement>(null);
  const backToChoices = useRef(false);
  useEffect(() => {
    if (!submitting) return;
    const suppress = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
    };
    window.addEventListener("keydown", suppress, true);
    return () => {
      window.removeEventListener("keydown", suppress, true);
    };
  }, [submitting]);
  useEffect(() => {
    if (
      found === undefined &&
      baseCi === undefined &&
      blocked === undefined &&
      backToChoices.current
    ) {
      backToChoices.current = false;
      startButton.current?.focus();
    }
  }, [found, baseCi, blocked]);
  const start = (choices: LaunchChoices) => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    void onStart(choices).then((answer) => {
      if (typeof answer !== "object") {
        ended(answer);
        return;
      }
      submitted.current = false;
      setSubmitting(false);
      asked.current = choices;
      if (answer.kind === "stop-unconfirmed") {
        setBlocked(answer);
        setFound(undefined);
        setBaseCi(undefined);
      } else if (answer.kind === "base-ci") {
        setBaseCi(answer);
        setFound(undefined);
        setBlocked(undefined);
      } else {
        setFound(answer);
        setBaseCi(undefined);
        setBlocked(undefined);
      }
    });
  };
  const back = () => {
    backToChoices.current = true;
    setFound(undefined);
    setBaseCi(undefined);
    setBlocked(undefined);
  };
  return {
    view:
      blocked !== undefined ? (
        <LaunchStopUnconfirmed
          id={id}
          blocked={blocked}
          starting={submitting}
          onBack={back}
          onStartAnyway={() => {
            if (asked.current === undefined) return;
            setBlocked(undefined);
            start({ ...asked.current, overrideStopUnconfirmed: true });
          }}
        />
      ) : baseCi !== undefined ? (
        <LaunchBaseCi
          id={id}
          found={baseCi}
          starting={submitting}
          onBack={back}
          onContinue={() => {
            if (asked.current === undefined) return;
            start({
              ...asked.current,
              baseCi: { revision: baseCi.revision, state: baseCi.state },
            });
          }}
        />
      ) : (
        found !== undefined && (
          <LaunchExistingChanges
            id={id}
            found={found}
            landing={landing}
            starting={submitting}
            onBack={back}
            onContinue={() => {
              if (asked.current === undefined) return;
              start({
                ...asked.current,
                existingChanges: found.fingerprint,
              });
            }}
          />
        )
      ),
    startButton,
    submitting,
    start,
    onCancel: (event) => {
      if (submitted.current) {
        event.preventDefault();
        return;
      }
      if (
        found !== undefined ||
        baseCi !== undefined ||
        blocked !== undefined
      ) {
        event.preventDefault();
        back();
      }
    },
  };
}
