// Location or folder summary body for a kind Intent reads proof for
// (`./IntentSummary.tsx`, `./proofKinds.ts`): reads each contained file
// (`./authenticatedRead.ts`, `./boundedPool.ts`), shows reading progress,
// inventory totals from successfully read files, and with declared proof one
// aggregate count line and summed duration with its coverage, the
// separate-observations note, observation spread and slowest cases
// (`./IntentSummarySlowest.tsx`), plus a per-child breakdown with
// each child's sum (`./IntentSummaryChildren.tsx`). Child names and slowest
// rows drill down through `onOpen`.
// Totals stay Partial while any file is pending or unread; a failed file is
// named with a retry that rereads only it.

import { useEffect, useMemo, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { mapPool } from "./boundedPool.ts";
import {
  fileCount,
  immediateChildrenOf,
  inventoryTotalLine,
  proofCountLineFor,
  type SummaryFileStatus,
} from "./intentSummaryCoverage.ts";
import {
  proofCostLineFor,
  summaryFiguresFor,
} from "./intentSummaryProofCost.ts";
import { IntentSummaryChildren } from "./IntentSummaryChildren.tsx";
import { IntentSummarySlowest } from "./IntentSummarySlowest.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import { IntentProofAbsence } from "./IntentProofAbsence.tsx";
import { latestProofOf, noLatestProof } from "./proofCases.ts";
import type { ProofKind } from "./proofKinds.ts";
import type { PublishedSource } from "./publishedSource.ts";

const summaryReadConcurrency = 4;

type ReadyTexts = ReadonlyMap<string, string>;

export function IntentProofSummary({
  path,
  files,
  location,
  proofKind,
  source,
  revision,
  proofRereading,
  onProofRetry,
  onOpen,
}: {
  readonly path: string;
  readonly files: readonly string[];
  readonly location: IntentLocation;
  readonly proofKind: ProofKind;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
  // Opens a child folder or file, or a slowest row's file at its line, in
  // Intent's one selection, revealing it in the tree.
  readonly onOpen: (next: IntentSelection) => void;
}) {
  const filesKey = files.join("\0");
  // The inventory by value, so a new array of the same files neither rereads
  // nor rewalks them.
  const inventory = useMemo(
    () => (filesKey === "" ? [] : filesKey.split("\0")),
    [filesKey],
  );
  const [ready, setReady] = useState<ReadyTexts>(() => new Map());
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const [retryTargets, setRetryTargets] = useState<readonly string[] | null>(
    null,
  );
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (inventory.length === 0) {
      setReady(new Map());
      setFailed(new Set());
      return;
    }
    const targets = retryTargets ?? inventory;
    const controller = new AbortController();
    if (retryTargets === null) {
      setReady(new Map());
      setFailed(new Set());
    } else {
      setFailed((was) => {
        const next = new Set(was);
        for (const target of targets) next.delete(target);
        return next;
      });
      setReady((was) => {
        const next = new Map(was);
        for (const target of targets) next.delete(target);
        return next;
      });
    }
    void mapPool(targets, summaryReadConcurrency, async (filePath) => {
      try {
        const text = await readRepositoryFileAt(
          source,
          filePath,
          revision,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setReady((was) => {
          const next = new Map(was);
          next.set(filePath, text);
          return next;
        });
      } catch {
        if (controller.signal.aborted) return;
        setFailed((was) => new Set(was).add(filePath));
      }
    });
    return () => {
      controller.abort();
    };
  }, [source, revision, inventory, retryTargets, retryKey]);

  const proof = location.proof;
  const readableProof =
    proof !== undefined && !("problem" in proof) ? proof : undefined;
  const latest = useMemo(
    () =>
      readableProof === undefined
        ? undefined
        : latestProofOf(readableProof.observations),
    [readableProof],
  );
  // One walk of the read files per change of inventory, texts, statuses, or
  // proof, not per figure, child, or render.
  const { selection, children } = useMemo(() => {
    const statusOf = (filePath: string): SummaryFileStatus => {
      if (ready.has(filePath)) return "ready";
      if (failed.has(filePath)) return "failed";
      return "pending";
    };
    return summaryFiguresFor(
      inventory,
      immediateChildrenOf(path, inventory),
      statusOf,
      (filePath) => ready.get(filePath),
      proofKind.rowsOf,
      latest ?? noLatestProof,
    );
  }, [path, inventory, ready, failed, proofKind, latest]);
  const { coverage, inventoryCount, observed, cost, spread } = selection;
  const { words } = proofKind;
  const settled = coverage.pendingCount === 0;

  return (
    <>
      {coverage.pendingCount > 0 ? (
        <p className="intent-summary-progress quiet">
          {String(coverage.readyCount + coverage.failedCount)} of{" "}
          {fileCount(coverage.inventory)} read
        </p>
      ) : null}
      <p className="intent-summary-scenarios">
        {inventoryTotalLine(coverage, inventoryCount, words)}
      </p>
      {[...failed].map((filePath) => (
        <p key={filePath} className="intent-file-problem" role="alert">
          {filePath} could not be read.{" "}
          <button
            type="button"
            onClick={() => {
              setRetryTargets([filePath]);
              setRetryKey((n) => n + 1);
            }}
          >
            Retry
          </button>
        </p>
      ))}
      {latest === undefined ? (
        <IntentProofAbsence
          proofKind={proofKind}
          proof={proof}
          rereading={proofRereading}
          onRetry={onProofRetry}
        />
      ) : settled || coverage.readyCount > 0 ? (
        <>
          <p className="intent-proof-counts intent-summary-proof-counts">
            {proofCountLineFor(coverage, observed, words)}
          </p>
          <p className="intent-proof-counts">
            {proofCostLineFor(coverage, cost, words)}
          </p>
          {spread === undefined ? null : (
            <>
              <p className="intent-proof-counts quiet">{words.costNote}</p>
              <p className="intent-proof-counts">{spread}</p>
              <IntentSummarySlowest
                path={path}
                rows={selection.slowest}
                fileBlobs={readableProof?.fileBlobs ?? {}}
                words={words}
                onOpen={onOpen}
              />
            </>
          )}
          <IntentSummaryChildren
            childList={children}
            words={words}
            onOpen={onOpen}
          />
        </>
      ) : null}
    </>
  );
}
