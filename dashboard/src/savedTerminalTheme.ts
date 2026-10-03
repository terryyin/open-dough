// The terminal theme saved on this machine, as the page knows it. `saved`
// changes only when a read answers or a save succeeds, so anything that follows
// it never shows an unsaved choice.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  terminalThemeEndpoint,
  terminalThemeSaveEndpoint,
} from "./terminalThemeSetting.ts";
import { isTerminalThemeId, type TerminalThemeId } from "./terminalThemes.ts";
import { refusalMessage } from "./refusalMessage.ts";

async function terminalThemeRequest(
  theme?: TerminalThemeId,
): Promise<TerminalThemeId> {
  const response = await fetch(
    theme === undefined ? terminalThemeEndpoint : terminalThemeSaveEndpoint,
    theme === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme }),
        },
  );
  const answer: unknown = await response.json().catch(() => undefined);
  if (!response.ok)
    throw new Error(
      refusalMessage(
        answer,
        theme === undefined
          ? "The saved terminal theme could not be read. Retry the operation."
          : "The terminal theme could not be saved. Retry the operation; the previous theme was kept.",
      ),
    );
  if (
    typeof answer !== "object" ||
    answer === null ||
    !("theme" in answer) ||
    !isTerminalThemeId(answer.theme)
  )
    throw new Error(
      "The saved terminal theme could not be read. Retry the operation.",
    );
  return answer.theme;
}

export type SavedTerminalTheme = {
  // Undefined until the first read answers, or while it cannot be read.
  readonly saved: TerminalThemeId | undefined;
  readonly readProblem: string | undefined;
  readonly reread: () => void;
  // Resolves once `theme` is saved; rejects with the reason it was not.
  readonly save: (theme: TerminalThemeId) => Promise<void>;
};

export function useSavedTerminalTheme(): SavedTerminalTheme {
  const [saved, setSaved] = useState<TerminalThemeId>();
  const [readProblem, setReadProblem] = useState<string>();
  const [reads, setReads] = useState(0);
  const readRevision = useRef(0);
  useEffect(() => {
    let current = true;
    const revision = ++readRevision.current;
    setReadProblem(undefined);
    void terminalThemeRequest().then(
      (theme) => {
        if (current && revision === readRevision.current) setSaved(theme);
      },
      (error: unknown) => {
        if (current && revision === readRevision.current)
          setReadProblem(
            error instanceof Error
              ? error.message
              : "The saved terminal theme could not be read.",
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
  const save = useCallback(async (theme: TerminalThemeId) => {
    // The save owns what follows; an older read is only a snapshot.
    readRevision.current += 1;
    setSaved(await terminalThemeRequest(theme));
    setReadProblem(undefined);
  }, []);
  return { saved, readProblem, reread, save };
}
