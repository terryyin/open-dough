// CI entry names open their configured location in this Intent page's
// browser. Unmatched historical entries remain readable without a dead link.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { ScopePath } from "./CiProofTable.tsx";

const EntryNavigation = createContext<
  | {
      readonly locations: readonly IntentLocation[] | undefined;
      readonly open: (path: string) => void;
    }
  | undefined
>(undefined);

export function IntentCiEntryNavigation({
  locations,
  panelId,
  onOpen,
  children,
}: {
  readonly locations: readonly IntentLocation[] | undefined;
  readonly panelId: string;
  readonly onOpen: (path: string) => void;
  readonly children: ReactNode;
}) {
  const [arrivals, setArrivals] = useState(0);
  useEffect(() => {
    if (arrivals === 0) return;
    const reading = document
      .getElementById(panelId)
      ?.querySelector<HTMLElement>(".intent-reading");
    if (reading === undefined || reading === null) return;
    reading.scrollTop = 0;
    reading.focus();
  }, [arrivals, panelId]);
  return (
    <EntryNavigation
      value={{
        locations,
        open: (path) => {
          onOpen(path);
          setArrivals((n) => n + 1);
        },
      }}
    >
      {children}
    </EntryNavigation>
  );
}

export function IntentCiEntryLink({ path }: { readonly path: string }) {
  const navigation = useContext(EntryNavigation);
  const name = <ScopePath path={path} />;
  if (!navigation?.locations?.some((location) => location.path === path))
    return name;
  return (
    <button
      type="button"
      className="intent-open-link"
      onClick={() => {
        navigation.open(path);
      }}
    >
      {name}
    </button>
  );
}
