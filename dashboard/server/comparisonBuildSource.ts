// External evidence read by the story CI comparison rules. Production reads
// Git history and CI artifacts; comparison selection never depends on the
// transport used to acquire those facts.
import type { CiProof, CiProofRun } from "../src/ciProof.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import { firstParentChain } from "./baseCiRevisionGit.ts";
import { readCiProofArtifact } from "./ciProofArtifact.ts";
import { GitFailure, runGit, type GitCall } from "./gitRunner.ts";
import { parseDiffNameStatus } from "../../src/skills/dough-execute-plan/scripts/ci-path-applicability.mjs";

export type ComparisonHistory = {
  readonly firstParents: (
    revision: string,
    limit: number,
  ) => Promise<readonly string[]>;
  readonly laterTrunk: (
    landing: string,
    head: string,
    limit: number,
  ) => Promise<readonly string[]>;
  readonly workflowAt: (
    revision: string,
    path: string,
  ) => Promise<string | null>;
  readonly changesBetween: (
    from: string,
    to: string,
  ) => Promise<string[][] | null>;
};

export type ComparisonBuildSource = {
  readonly lookup: RevisionCiLookup;
  readonly history: ComparisonHistory;
  readonly workflow: string;
  readonly proofOf: (run: CiProofRun) => Promise<CiProof>;
};

export function comparisonHistory(call: GitCall): ComparisonHistory {
  return {
    firstParents: (revision, limit) => firstParentChain(revision, call, limit),
    async laterTrunk(landing, head, limit) {
      const { stdout } = await runGit(
        [
          "rev-list",
          "--first-parent",
          "--reverse",
          "--ancestry-path",
          `${landing}..${head}`,
        ],
        call,
      );
      return stdout.trim().split("\n").filter(Boolean).slice(0, limit);
    },
    async workflowAt(revision, path) {
      try {
        return (await runGit(["show", `${revision}:${path}`], call)).stdout;
      } catch (error) {
        if (error instanceof GitFailure) return null;
        throw error;
      }
    },
    async changesBetween(from, to) {
      if (from === to) return [];
      try {
        const { stdout } = await runGit(
          ["diff", "--name-status", "-M", from, to],
          call,
        );
        return parseDiffNameStatus(stdout) as string[][];
      } catch (error) {
        if (error instanceof GitFailure) return null;
        throw error;
      }
    },
  };
}

export function comparisonBuildSource(
  lookup: RevisionCiLookup,
  call: GitCall,
  workflow: string,
  proof: { readonly repository: string; readonly signal: AbortSignal },
): ComparisonBuildSource {
  return {
    lookup,
    history: comparisonHistory(call),
    workflow,
    proofOf: (run) => readCiProofArtifact(proof.repository, run, proof.signal),
  };
}
