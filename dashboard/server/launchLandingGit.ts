// Recording owns object preservation; reads never need to create these refs.
import type { LaunchLanding } from "../src/launchLanding.ts";
import { runGit, defaultGitOutputLimit } from "./gitRunner.ts";
import { remoteBranchHead } from "./gitTargetFetch.ts";
import {
  comparisonPins,
  heldPins,
  landingGitCall,
  pinPair,
  removePins,
  type HeldPin,
} from "./launchLandingPins.ts";
import { RefusedRequest } from "./localOrigin.ts";

export {
  heldPins,
  pinPair,
  removePins,
  writePins,
  type HeldPin,
} from "./launchLandingPins.ts";

const git = (repository: string, args: readonly string[]) =>
  runGit(args, landingGitCall(repository));
const oneShotRefPrefix = "refs/open-dough/one-shot/";
const landingRefPrefix = (reference: string) =>
  `${oneShotRefPrefix}${reference}/`;
type LandingDelivery = Pick<LaunchLanding, "reference" | "delivery">;
const landingDeliveryRefPrefix = ({ reference, delivery }: LandingDelivery) =>
  `${landingRefPrefix(reference)}${delivery}/`;

// Recorded landing ancestry from already retained local Git objects, across
// all merge parents. Only requested landing revisions enter the order; private
// branch commits do not become observations. No fetch, helper or ref mutation
// belongs to history reading. Missing objects/paths leave the order unsupported;
// a previously collected order can still be used.
export async function readLandingOrder(
  repositories: readonly string[],
  revisions: readonly string[],
  endpoint?: string,
  signal?: AbortSignal,
): Promise<readonly string[] | undefined> {
  const wanted = [
    ...new Set([...revisions, ...(endpoint === undefined ? [] : [endpoint])]),
  ];
  if (wanted.length === 0) return [];
  const retained = new Set(wanted);
  let best: readonly string[] | undefined;
  let score = -1;
  const bounded =
    signal === undefined
      ? AbortSignal.timeout(30_000)
      : AbortSignal.any([signal, AbortSignal.timeout(30_000)]);
  for (const repository of new Set(repositories)) {
    const local = (args: readonly string[], input?: string) =>
      runGit(args, {
        cwd: repository,
        maxBuffer: defaultGitOutputLimit,
        env: {
          GIT_NO_LAZY_FETCH: "1",
          GIT_ALLOW_PROTOCOL: "file",
          GIT_TERMINAL_PROMPT: "0",
        },
        signal: bounded,
        ...(input === undefined ? {} : { input }),
      });
    try {
      const checked = await local(
        ["cat-file", "--batch-check=%(objectname) %(objecttype)"],
        `${wanted.join("\n")}\n`,
      );
      const known = checked.stdout
        .trim()
        .split("\n")
        .flatMap((line) => {
          const [revision, kind] = line.split(" ");
          return revision !== undefined && kind === "commit" ? [revision] : [];
        });
      if (
        known.length === 0 ||
        (endpoint !== undefined && !known.includes(endpoint))
      )
        continue;
      const latest = (
        await local(["rev-list", "--topo-order", "--max-count=1", ...known])
      ).stdout.trim();
      let order = (
        await local(["rev-list", "--topo-order", "--reverse", latest])
      ).stdout
        .trim()
        .split("\n")
        .filter((revision) => retained.has(revision));
      if (endpoint !== undefined && !order.includes(endpoint))
        order = (
          await local(["rev-list", "--topo-order", "--reverse", endpoint])
        ).stdout
          .trim()
          .split("\n")
          .filter((revision) => retained.has(revision));
      const covered = wanted.filter((revision) =>
        order.includes(revision),
      ).length;
      if (covered > score) {
        best = order;
        score = covered;
      }
      if (covered === wanted.length) return order;
    } catch {
      if (bounded.aborted) return best;
      // Another retained local repository may still hold the pinned objects.
    }
  }
  return best;
}
async function verifyComparison({ repository, base, revision }: LaunchLanding) {
  const { stdout } = await runGit(["cat-file", "--batch-check=%(objecttype)"], {
    ...landingGitCall(repository),
    input: `${base}\n${revision}\n`,
  });
  if (stdout.trim() !== "commit\ncommit")
    throw new Error("Both comparison ends must be commits.");
  await git(repository, ["merge-base", "--is-ancestor", base, revision]);
}

export async function verifyLanding(
  landing: LaunchLanding,
  prepare?: { workspace: string; branch: string },
): Promise<HeldPin[]> {
  const { repository, revision, remote, target } = landing;
  const prefix = landingDeliveryRefPrefix(landing);
  const expected = comparisonPins(prefix, landing);
  try {
    if (prepare !== undefined) {
      await verifyComparison(landing);
      // The candidate is what the workspace holds and carries the launch's
      // branch: its tip, or a detached integration of that tip onto trunk.
      if (
        (await git(prepare.workspace, ["rev-parse", "HEAD"])).stdout.trim() !==
        revision
      )
        throw new Error("The candidate is not this launch's workspace HEAD.");
      await git(prepare.workspace, [
        "merge-base",
        "--is-ancestor",
        `refs/heads/${prepare.branch}`,
        revision,
      ]);
      return expected;
    }
    const held = await heldPins(repository, prefix);
    const repairs = expected.filter(
      ({ ref, objectId }) =>
        !held.some((pin) => pin.ref === ref && pin.objectId === objectId),
    );
    if (repairs.length === 0) {
      const tip = await remoteBranchHead(
        remote,
        target,
        landingGitCall(repository),
      );
      if (tip === revision) return repairs;
      if (tip === undefined)
        throw new Error("The authorized target is missing.");
    }
    // Fetch only into FETCH_HEAD: the record operation moves no checkout branch.
    await git(repository, ["fetch", "--no-tags", "--refmap=", remote, target]);
    await git(repository, [
      "merge-base",
      "--is-ancestor",
      revision,
      "FETCH_HEAD",
    ]);
    if (repairs.length > 0) await verifyComparison(landing);
    return repairs;
  } catch {
    throw new RefusedRequest(
      409,
      prepare === undefined
        ? "The authorized remote target has not confirmed this commit comparison."
        : "This is not the established launch's workspace candidate and commit comparison.",
    );
  }
}
// The landing pins `repository` holds, ordered by Git ref name: the whole
// one-shot namespace, one reporting reference's pins, or one delivery's pair.
export const heldLandingPins = (
  repository: string,
  scope?: { readonly reference: string; readonly delivery?: string },
): Promise<HeldPin[]> =>
  heldPins(
    repository,
    scope === undefined
      ? oneShotRefPrefix
      : scope.delivery === undefined
        ? landingRefPrefix(scope.reference)
        : landingDeliveryRefPrefix({ ...scope, delivery: scope.delivery }),
  );
export const pinLanding = (landing: LaunchLanding): Promise<void> =>
  pinPair(landing.repository, landingDeliveryRefPrefix(landing), landing);

export const removeLandingDeliveryPins = (
  landing: LaunchLanding,
): Promise<void> =>
  removePins(landing.repository, landingDeliveryRefPrefix(landing));

export const removeLandingPins = (
  repository: string,
  reference: string,
): Promise<void> => removePins(repository, landingRefPrefix(reference));
