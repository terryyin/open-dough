// Purpose and Proof of the selected file, or of nothing selected yet
// (`./IntentBrowser.tsx`), in one of two reader layouts. With tabs, two tabs
// of one Intent tablist (`./IntentTabs.tsx`) at the top of the reading area,
// the chosen tab's panel filling it; side by side, both panels together, each
// named by its heading and scrolling on its own. The **Side by side** toggle
// beside the tabs switches layouts. The chosen tab is the reader's page state
// and the layout one choice this browser keeps, both owned by the Intent
// browser so selecting another file keeps them, and opening from the
// candidates record chooses Purpose and starts a fresh reading positioned on
// its case. The file read and proof are the
// browser's, so a tab or layout switch reads nothing again, and each returns
// to where it was read in this file (`./useIntentReadingPlaces.ts`).

import { useRef, type RefObject } from "react";
import type { IntentLocationProof } from "./authenticatedIntentRead.ts";
import { IntentProof } from "./IntentProof.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import {
  IntentTabs,
  intentTabId,
  intentTabPanelId,
  type IntentTabOption,
} from "./IntentTabs.tsx";
import { useIntentReadingPlaces } from "./useIntentReadingPlaces.ts";
import "./frame-controls.css";
import "./intent-file-reading.css";

export type IntentReadingTab = "purpose" | "proof";

export type IntentReadingLayout = "tabs" | "side-by-side";

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
  layout,
  onChooseLayout,
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
  readonly layout: IntentReadingLayout;
  readonly onChooseLayout: (next: IntentReadingLayout) => void;
  readonly idPrefix: string;
  // The reading area that scrolls the chosen panel with tabs.
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
  const purposeBody = useRef<HTMLDivElement | null>(null);
  const keepPlaces = useIntentReadingPlaces({
    path,
    tab,
    layout,
    readingArea,
    purposeBody,
  });
  const text = read?.state === "ready" ? read.text : undefined;
  const sideBySide = layout === "side-by-side";

  function chooseTab(next: IntentReadingTab) {
    if (next === tab) return;
    keepPlaces();
    onChooseTab(next);
  }

  function toggleLayout() {
    keepPlaces();
    onChooseLayout(sideBySide ? "tabs" : "side-by-side");
  }

  function panel(value: IntentReadingTab) {
    if (sideBySide) return { className: "intent-reading-panel" } as const;
    return {
      className: "intent-reading-panel",
      role: "tabpanel",
      id: intentTabPanelId(idPrefix, value),
      "aria-labelledby": intentTabId(idPrefix, value),
      hidden: tab !== value,
    } as const;
  }

  // Tabs name the panels; side by side, their headings do.
  const headingClass = sideBySide ? undefined : "visually-hidden";

  return (
    <>
      <div className="intent-reading-bar">
        {sideBySide ? null : (
          <IntentTabs
            options={tabs}
            selected={tab}
            onSelect={chooseTab}
            label="Purpose and Proof"
            idPrefix={idPrefix}
          />
        )}
        <button
          type="button"
          className="frame-button intent-reading-layout"
          aria-pressed={sideBySide}
          onClick={toggleLayout}
        >
          Side by side
        </button>
      </div>
      <div
        className={
          sideBySide
            ? "intent-reading-panels is-side-by-side"
            : "intent-reading-panels"
        }
      >
        <div {...panel("purpose")}>
          <section className="intent-purpose" aria-label="Purpose">
            <h3 className={headingClass}>Purpose</h3>
            <div className="intent-reading-panel-body" ref={purposeBody}>
              {path === "" ? (
                <p className="quiet">
                  Select a feature file to read its Purpose.
                </p>
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
            </div>
          </section>
        </div>
        <div {...panel("proof")}>
          <section className="intent-proof" aria-label="Proof">
            <h3 className={headingClass}>Proof</h3>
            <div className="intent-reading-panel-body">
              <IntentProof
                path={path}
                kind={kind}
                text={text}
                proof={proof}
                rereading={proofRereading}
                onRetry={onProofRetry}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
