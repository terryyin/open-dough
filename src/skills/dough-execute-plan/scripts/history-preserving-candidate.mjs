// Builds the candidate for history-preserving-publication.mjs: the published
// tip merged onto the fetched target in a detached owned workspace, through
// the backlog merge adapter when either side touched the backlog or its done
// records, and as an agent-credited merge commit otherwise.
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

async function historyPreservingMerge(workspace, ref) {
  const head = await revParse(workspace, "HEAD");
  const base = (await git(workspace, "merge-base", "HEAD", ref)).stdout.trim();
  if (base === head) {
    await git(workspace, "merge", "--ff-only", ref);
    return;
  }
  await git(workspace, "merge", "--no-ff", "--no-commit", ref);
  await creditMergeInProgress(workspace);
  await git(workspace, "commit", "--no-edit");
}

export async function constructCandidate(
  workspace,
  trunkRef,
  publishedTip,
  file,
) {
  await git(workspace, "checkout", "--detach", trunkRef);
  if (await backlogTouched(workspace, publishedTip, file)) {
    const merged = await mergeThroughAdapter(workspace, publishedTip, file);
    if (merged.code !== 0) {
      return { ok: false, adapterStatus: merged.status, merged };
    }
    return {
      ok: true,
      sha: await revParse(workspace, "HEAD"),
      adapterStatus: merged.status,
    };
  }
  try {
    await historyPreservingMerge(workspace, publishedTip);
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
