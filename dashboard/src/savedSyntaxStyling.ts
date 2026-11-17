// The syntax-styling choice saved on this machine, as the page knows it. The
// page reads it once (`SavedSyntaxStylingProvider`) and shares that reading
// with System settings (`useSavedSyntaxStyling`). `saved` changes only when a
// read answers or a save succeeds, so anything that follows it never shows an
// unsaved choice. Intent and diffs do not consume it yet.
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  syntaxStylingEndpoint,
  syntaxStylingSaveEndpoint,
} from "./syntaxStylingSetting.ts";
import {
  isSyntaxStylingId,
  type SyntaxStylingId,
} from "./syntaxStylingChoices.ts";
import { localSettingRequest } from "./localSettingRequest.ts";

async function syntaxStylingRequest(
  styling?: SyntaxStylingId,
): Promise<SyntaxStylingId> {
  const answer = await localSettingRequest(
    styling === undefined ? syntaxStylingEndpoint : syntaxStylingSaveEndpoint,
    styling === undefined ? undefined : { styling },
    styling === undefined
      ? "The saved syntax styling could not be read. Retry the operation."
      : "The syntax styling could not be saved. Retry the operation; the previous setting was kept.",
  );
  if (
    typeof answer !== "object" ||
    answer === null ||
    !("styling" in answer) ||
    !isSyntaxStylingId(answer.styling)
  )
    throw new Error(
      "The saved syntax styling could not be read. Retry the operation.",
    );
  return answer.styling;
}

export type SavedSyntaxStyling = {
  // Undefined until the first read answers, or while it cannot be read.
  readonly saved: SyntaxStylingId | undefined;
  readonly readProblem: string | undefined;
  readonly reread: () => void;
  // Resolves once `styling` is saved; rejects with the reason it was not.
  readonly save: (styling: SyntaxStylingId) => Promise<void>;
};

function useSyntaxStylingReading(): SavedSyntaxStyling {
  const [saved, setSaved] = useState<SyntaxStylingId>();
  const [readProblem, setReadProblem] = useState<string>();
  const [reads, setReads] = useState(0);
  const readRevision = useRef(0);
  useEffect(() => {
    let current = true;
    const revision = ++readRevision.current;
    setReadProblem(undefined);
    void syntaxStylingRequest().then(
      (styling) => {
        if (current && revision === readRevision.current) setSaved(styling);
      },
      (error: unknown) => {
        if (current && revision === readRevision.current)
          setReadProblem(
            error instanceof Error
              ? error.message
              : "The saved syntax styling could not be read.",
          );
      },
    );
    return () => {
      current = false;
    };
  }, [reads]);
  const reread = useCallback(() => {
    setReads((count) => count + 1);
  }, []);
  const save = useCallback(async (styling: SyntaxStylingId) => {
    // The save owns what follows; an older read is only a snapshot.
    readRevision.current += 1;
    setSaved(await syntaxStylingRequest(styling));
    setReadProblem(undefined);
  }, []);
  return useMemo(
    () => ({ saved, readProblem, reread, save }),
    [saved, readProblem, reread, save],
  );
}

// Without a provider nothing has been read, so Default is assumed and a save
// is refused.
const sharedReading = createContext<SavedSyntaxStyling>({
  saved: undefined,
  readProblem: undefined,
  reread: () => undefined,
  save: () =>
    Promise.reject(new Error("The syntax styling could not be saved.")),
});

export function SavedSyntaxStylingProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  return createElement(
    sharedReading.Provider,
    { value: useSyntaxStylingReading() },
    children,
  );
}

export function useSavedSyntaxStyling(): SavedSyntaxStyling {
  return useContext(sharedReading);
}
