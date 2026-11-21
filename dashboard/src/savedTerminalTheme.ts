// The terminal theme saved on this machine, as the page knows it. The page
// reads it once (`SavedTerminalThemeProvider`) and shares that reading with
// System settings and every embedded terminal (`useSavedTerminalTheme`).
// `saved` changes only when a read answers or a save succeeds, so anything
// that follows it never shows an unsaved choice.
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
import type { TerminalThemeSource } from "./terminalThemeSource.ts";
import type { TerminalThemeId } from "./terminalThemes.ts";

export type SavedTerminalTheme = {
  // Undefined until the first read answers, or while it cannot be read.
  readonly saved: TerminalThemeId | undefined;
  readonly readProblem: string | undefined;
  readonly reread: () => void;
  // Resolves once `theme` is saved; rejects with the reason it was not.
  readonly save: (theme: TerminalThemeId) => Promise<void>;
};

function useTerminalThemeReading(
  source: TerminalThemeSource,
): SavedTerminalTheme {
  const [saved, setSaved] = useState<TerminalThemeId>();
  const [readProblem, setReadProblem] = useState<string>();
  const [reads, setReads] = useState(0);
  const readRevision = useRef(0);
  useEffect(() => {
    let current = true;
    const revision = ++readRevision.current;
    setReadProblem(undefined);
    void source.read().then(
      ({ theme }) => {
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
  }, [reads, source]);
  const reread = useCallback(() => {
    setReads((count) => count + 1);
  }, []);
  const save = useCallback(
    async (theme: TerminalThemeId) => {
      // The save owns what follows; an older read is only a snapshot.
      readRevision.current += 1;
      setSaved((await source.save(theme)).theme);
      setReadProblem(undefined);
    },
    [source],
  );
  return useMemo(
    () => ({ saved, readProblem, reread, save }),
    [saved, readProblem, reread, save],
  );
}

// Without a provider nothing has been read, so terminals show Default and a
// save is refused.
const sharedReading = createContext<SavedTerminalTheme>({
  saved: undefined,
  readProblem: undefined,
  reread: () => undefined,
  save: () =>
    Promise.reject(new Error("The terminal theme could not be saved.")),
});

export function SavedTerminalThemeProvider({
  children,
  source,
}: {
  readonly children: ReactNode;
  readonly source: TerminalThemeSource;
}) {
  return createElement(
    sharedReading.Provider,
    { value: useTerminalThemeReading(source) },
    children,
  );
}

export function useSavedTerminalTheme(): SavedTerminalTheme {
  return useContext(sharedReading);
}

// The theme terminals show: the saved one, or Default until one is read.
export function useShownTerminalTheme(): TerminalThemeId {
  return useSavedTerminalTheme().saved ?? "default";
}
