// Gherkin location or folder summary body (`./IntentSummary.tsx`): reads each
// contained feature (`./authenticatedRead.ts`, `./boundedPool.ts`), shows
// reading progress, scenario totals from successfully read files, and with
// declared proof one aggregate count line and summed duration with its
// coverage, the separate-observations note, observation spread and slowest
// scenarios (`./IntentSummarySlowest.tsx`), plus a per-child breakdown with
// each child's sum (`./intentSummaryCoverage.ts`,
// `./intentSummaryProofCost.ts`).
// Totals stay Partial while any file is pending or unread; a failed file is
// named with a retry that rereads only it.

import { useEffect, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { mapPool } from "./boundedPool.ts";
import {
  coverageOf,
  immediateChildrenOf,
  latestByIdentity,
  observationsForFiles,
  proofCountLineFor,
  scenarioCountForFiles,
  scenarioTotalLine,
  type CoverageTally,
  type SummaryFileStatus,
} from "./intentSummaryCoverage.ts";
import {
  proofCostLineFor,
  proofCostNote,
  proofCostOf,
  proofSpreadLine,
  slowestRowsOf,
} from "./intentSummaryProofCost.ts";
import { IntentSummarySlowest } from "./IntentSummarySlowest.tsx";
import type { SuccessfulProofObservation } from "./cucumberProof.ts";
import { IntentProofAbsence } from "./IntentProofAbsence.tsx";
import type { PublishedSource } from "./publishedSource.ts";

const summaryReadConcurrency = 4;

function ChildProofLines({
  coverage,
  observed,
}: {
  readonly coverage: CoverageTally;
  readonly observed: readonly (SuccessfulProofObservation | undefined)[];
}) {
  return (
    <>
      <p className="intent-proof-counts">
        {proofCountLineFor(coverage, observed)}
      </p>
      <p className="intent-proof-counts">
        {proofCostLineFor(coverage, proofCostOf(observed))}
      </p>
    </>
  );
}

type ReadyTexts = ReadonlyMap<string, string>;

export function IntentGherkinSummary({
  path,
  files,
  location,
  source,
  revision,
  proofRereading,
  onProofRetry,
}: {
  readonly path: string;
  readonly files: readonly string[];
  readonly location: IntentLocation;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
}) {
  const filesKey = files.join("\0");
  const [ready, setReady] = useState<ReadyTexts>(() => new Map());
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const [retryTargets, setRetryTargets] = useState<readonly string[] | null>(
    null,
  );
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const inventory = filesKey === "" ? [] : filesKey.split("\0");
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
  }, [source, revision, filesKey, retryTargets, retryKey]);

  const statusOf = (filePath: string): SummaryFileStatus => {
    if (ready.has(filePath)) return "ready";
    if (failed.has(filePath)) return "failed";
    return "pending";
  };
  const textOf = (filePath: string) => ready.get(filePath);
  const coverage = coverageOf(files, statusOf);
  const scenarioCount = scenarioCountForFiles(files, textOf);
  const settled = coverage.pendingCount === 0;
  const proof = location.proof;
  const children = immediateChildrenOf(path, files);
  const readable = proof !== undefined && !("problem" in proof);
  const latest = readable ? latestByIdentity(proof.observations) : undefined;
  const observed =
    latest === undefined ? [] : observationsForFiles(files, textOf, latest);
  const cost = proofCostOf(observed);
  const spread = proofSpreadLine(cost);

  return (
    <>
      {coverage.pendingCount > 0 ? (
        <p className="intent-summary-progress quiet">
          {String(coverage.readyCount + coverage.failedCount)} of{" "}
          {String(coverage.inventory)} files read
        </p>
      ) : null}
      <p className="intent-summary-scenarios">
        {scenarioTotalLine(coverage, scenarioCount)}
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
          kind={location.kind}
          proof={proof}
          rereading={proofRereading}
          onRetry={onProofRetry}
        />
      ) : settled || coverage.readyCount > 0 ? (
        <>
          <p className="intent-proof-counts intent-summary-proof-counts">
            {proofCountLineFor(coverage, observed)}
          </p>
          <p className="intent-proof-counts">
            {proofCostLineFor(coverage, cost)}
          </p>
          {spread === undefined ? null : (
            <>
              <p className="intent-proof-counts quiet">{proofCostNote}</p>
              <p className="intent-proof-counts">{spread}</p>
              <IntentSummarySlowest
                path={path}
                rows={slowestRowsOf(files, textOf, latest)}
                featureBlobs={readable ? proof.featureBlobs : {}}
              />
            </>
          )}
          {children.length > 0 ? (
            <ul
              className="intent-summary-children"
              aria-label="Summary by folder and file"
            >
              {children.map((child) => {
                const childCoverage = coverageOf(child.files, statusOf);
                const childScenarios = scenarioCountForFiles(
                  child.files,
                  textOf,
                );
                const showProof =
                  childCoverage.readyCount > 0 || !childCoverage.incomplete;
                return (
                  <li key={child.path}>
                    <code>{child.name}</code>
                    <p className="intent-summary-scenarios">
                      {scenarioTotalLine(childCoverage, childScenarios)}
                    </p>
                    {showProof ? (
                      <ChildProofLines
                        coverage={childCoverage}
                        observed={observationsForFiles(
                          child.files,
                          textOf,
                          latest,
                        )}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </>
      ) : null}
    </>
  );
}
