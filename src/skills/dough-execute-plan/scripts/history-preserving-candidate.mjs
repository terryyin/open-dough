// Builds the candidate for history-preserving-publication.mjs: the published
// tip merged onto the fetched target in a detached owned workspace, through
// the backlog merge adapter when either side touched the backlog or its done
// records, and as an agent-credited merge commit otherwise. A merge Git stops
// on a conflict stays as Git left it; once it is resolved and committed, that
// commit is the candidate.
import { fileURLToPath } from "node:url";
import { doneDirectoryBeside } from "../../dough-product-backlog/scripts/product-backlog-git-done-catalog.mjs";
import {
  creditMergeInProgress,
  DeveloperIdentityRefused,
} from "./workspace-agent-authorship.mjs";
import { exec, git, revParse } from "./publication-git.mjs";

const mergeCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog-git-merge.mjs",
    import.meta.url,
  ),
);

// Whether either side changed the backlog or the done directory beside it.
async function backlogTouched(workspace, ref, file) {
  const base = (await git(workspace, "merge-base", "HEAD", ref)).stdout.trim();
  const paths = ["--", file, doneDirectoryBeside(file)];
  const onTrunk = (
    await git(workspace, "diff", "--name-only", base, "HEAD", ...paths)
  ).stdout.trim();
  const onStory = (
    await git(workspace, "diff", "--name-only", base, ref, ...paths)
  ).stdout.trim();
  return onTrunk !== "" || onStory !== "";
}

async function mergeThroughAdapter(workspace, ref, file) {
  try {
    const { stdout, stderr } = await exec(process.execPath, [
      mergeCli,
      "merge",
      "--ref",
      ref,
      "--file",
      file,
      "--cwd",
      workspace,
    ]);
    return { code: 0, status: stdout.trim(), stdout, stderr };
  } catch (error) {
    return {
      code: error.code ?? 1,
      status: `${error.stdout ?? ""}${error.stderr ?? ""}`.trim(),
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

async function unmergedPaths(workspace) {
  const { stdout } = await git(
    workspace,
    "diff",
    "--name-only",
    "--diff-filter=U",
  );
  return stdout.split("\n").filter(Boolean);
}

// Answers the unmerged paths when Git stopped the merge on a conflict, and
// null once the merge is committed.
async function historyPreservingMerge(workspace, ref) {
  const head = await revParse(workspace, "HEAD");
  const base = (await git(workspace, "merge-base", "HEAD", ref)).stdout.trim();
  if (base === head) {
    await git(workspace, "merge", "--ff-only", ref);
    return null;
  }
  try {
    await git(workspace, "merge", "--no-ff", "--no-commit", ref);
  } catch (error) {
    const conflictedPaths = await unmergedPaths(workspace);
    if (conflictedPaths.length === 0) throw error;
    return conflictedPaths;
  }
  await creditMergeInProgress(workspace);
  await git(workspace, "commit", "--no-edit");
  return null;
}

// Whether the workspace `HEAD` is a merge of exactly the fetched target's tip
// and the published tip: a conflicted integration resolved and committed.
async function headMerges(workspace, trunkRef, publishedTip) {
  const [, ...parents] = (
    await git(workspace, "rev-list", "--parents", "-n", "1", "HEAD")
  ).stdout
    .trim()
    .split(" ");
  const sides = [
    await revParse(workspace, `${trunkRef}^{commit}`),
    await revParse(workspace, `${publishedTip}^{commit}`),
  ];
  return parents.length === 2 && sides.every((side) => parents.includes(side));
}

export async function constructCandidate(
  workspace,
  trunkRef,
  publishedTip,
  file,
) {
  const unresolved = await unmergedPaths(workspace);
  if (unresolved.length > 0) {
    return { ok: false, reason: "conflict", conflictedPaths: unresolved };
  }
  if (await headMerges(workspace, trunkRef, publishedTip)) {
    return {
      ok: true,
      resolved: true,
      sha: await revParse(workspace, "HEAD"),
      adapterStatus: null,
    };
  }
  await git(workspace, "checkout", "--detach", trunkRef);
  if (await backlogTouched(workspace, publishedTip, file)) {
    const merged = await mergeThroughAdapter(workspace, publishedTip, file);
    if (merged.code !== 0) {
      return {
        ok: false,
        adapterStatus: merged.status,
        merged,
        conflictedPaths: await unmergedPaths(workspace),
      };
    }
    return {
      ok: true,
      sha: await revParse(workspace, "HEAD"),
      adapterStatus: merged.status,
    };
  }
  try {
    const conflictedPaths = await historyPreservingMerge(
      workspace,
      publishedTip,
    );
    if (conflictedPaths) {
      return { ok: false, reason: "conflict", conflictedPaths };
    }
  } catch (error) {
    if (!(error instanceof DeveloperIdentityRefused)) throw error;
    return {
      ok: false,
      reason: "developer-identity-refused",
      error: error.message,
    };
  }
  return {
    ok: true,
    sha: await revParse(workspace, "HEAD"),
    adapterStatus: null,
  };
}
