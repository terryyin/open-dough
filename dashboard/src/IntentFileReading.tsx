// Purpose and Proof of the selected file, or of nothing selected yet
// (`./IntentBrowser.tsx`): two tabs of one Intent tablist (`./IntentTabs.tsx`)
// at the top of the reading area, the chosen tab's panel filling it. The
// chosen tab is the reader's page state, owned by the browser so selecting
// another file keeps it, and opening from the candidates record chooses
// Purpose and starts a fresh reading positioned on its case. The file read
// and proof are the browser's, so a tab switch reads nothing again; each tab
// returns to where it was read in this file, a positioned case included.

import { useLayoutEffect, useRef, type RefObject } from "react";
import type { IntentLocationProof } from "./authenticatedIntentRead.ts";
import { IntentProof } from "./IntentProof.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import {
  IntentTabs,
  intentTabId,
  intentTabPanelId,
  type IntentTabOption,
} from "./IntentTabs.tsx";

export type IntentReadingTab = "purpose" | "proof";

export type FileRead =
  | { readonly path: string; readonly state: "failed" }
  | { readonly path: string; readonly state: "ready"; readonly text: string };

const tabs: readonly IntentTabOption<IntentReadingTab>[] = [
  { value: "purpose", label: "Purpose" },
  { value: "proof", label: "Proof" },
];

export function IntentFileReading({
  tab,
  onChooseTab,
  idPrefix,
  readingArea,
  path,
  revision,
  read,
  kind,
  caseTarget,
  proof,
  proofRereading,
  onFileRetry,
  onProofRetry,
}: {
  readonly tab: IntentReadingTab;
  readonly onChooseTab: (next: IntentReadingTab) => void;
  readonly idPrefix: string;
  // The reading area that scrolls the chosen panel.
  readonly readingArea: RefObject<HTMLDivElement | null>;
  // The selected file's path, or "" when nothing is selected.
  readonly path: string;
  readonly revision: string;
  // The answered read of `path`, or undefined while it is being read.
  readonly read: FileRead | undefined;
  readonly kind: string | undefined;
  readonly caseTarget: string | undefined;
  readonly proof: IntentLocationProof | undefined;
  readonly proofRereading: boolean;
  readonly onFileRetry: () => void;
  readonly onProofRetry: () => void;
}) {
  // Where each tab was last read, for one file.
  const places = useRef({ path, top: { purpose: 0, proof: 0 } });
  const text = read?.state === "ready" ? read.text : undefined;

  function chooseTab(next: IntentReadingTab) {
    if (next === tab) return;
    if (places.current.path !== path) {
      places.current = { path, top: { purpose: 0, proof: 0 } };
    }
    places.current.top[tab] = readingArea.current?.scrollTop ?? 0;
    onChooseTab(next);
  }

  useLayoutEffect(() => {
    const area = readingArea.current;
    if (area === null || places.current.path !== path) return;
    area.scrollTop = places.current.top[tab];
    // Only a tab switch returns to a place; a new file starts its own.
  }, [tab]);

  function panel(value: IntentReadingTab) {
    return {
      role: "tabpanel",
      id: intentTabPanelId(idPrefix, value),
      "aria-labelledby": intentTabId(idPrefix, value),
      hidden: tab !== value,
    } as const;
  }

  return (
    <>
      <div className="intent-reading-bar">
        <IntentTabs
          options={tabs}
          selected={tab}
          onSelect={chooseTab}
          label="Purpose and Proof"
          idPrefix={idPrefix}
        />
      </div>
      <div className="intent-reading-panel" {...panel("purpose")}>
        <section className="intent-purpose" aria-label="Purpose">
          <h3 className="visually-hidden">Purpose</h3>
          {path === "" ? (
            <p className="quiet">Select a feature file to read its Purpose.</p>
          ) : read?.state === "failed" ? (
            <p className="intent-file-problem" role="alert">
              {path} could not be read.{" "}
              <button type="button" onClick={onFileRetry}>
                Retry
              </button>
            </p>
          ) : text !== undefined ? (
            <IntentSourceLines
              text={text}
              revision={revision}
              path={path}
              {...(kind === undefined ? {} : { language: kind })}
              {...(caseTarget === undefined ? {} : { caseTarget })}
            />
          ) : (
            <p className="quiet">Reading {path}…</p>
          )}
        </section>
      </div>
      <div className="intent-reading-panel" {...panel("proof")}>
        <section className="intent-proof" aria-label="Proof">
          <h3 className="visually-hidden">Proof</h3>
          <IntentProof
            path={path}
            kind={kind}
            text={text}
            proof={proof}
            rereading={proofRereading}
            onRetry={onProofRetry}
          />
        </section>
      </div>
    </>
  );
}
