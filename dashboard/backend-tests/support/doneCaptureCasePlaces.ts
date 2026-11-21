// Where a Done capture case's launches start and its work happens: the
// materialized checkout, its base's tree, and its named worktrees by the
// canonical paths Git registers. Lives beside ./doneCaptureCaseBuilder.ts.
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import { type Checkout, minutesAgo, work } from "./doneCaptureCase.ts";

export type Places<Worktree extends string = string> = {
  checkout: Checkout;
  baseTree: string;
  worktrees: Record<Worktree, string>;
};

// Work steps stated directly, or dated `at` minutes before the case's clock.
export type Dated<Name extends string> =
  | CheckoutWorkBuilder<Name>
  | ((at: typeof minutesAgo) => CheckoutWorkBuilder<Name>);

// The checkout's places, as Git resolves them.
export async function placesOf<Worktree extends string>(
  checkout: Checkout,
): Promise<Places<Worktree>> {
  const [{ stdout: listed }, { stdout: tree }] = await Promise.all([
    git(checkout.integration, "worktree", "list", "--porcelain"),
    git(checkout.integration, "rev-parse", `${checkout.base}^{tree}`),
  ]);
  const worktrees: Record<string, string> = {};
  for (const entry of listed.split("\n\n")) {
    const at = /^worktree (.+)$/m.exec(entry)?.[1];
    const branch = /^branch refs\/heads\/(.+)$/m.exec(entry)?.[1];
    if (at !== undefined && branch !== undefined) worktrees[branch] = at;
  }
  return { checkout, baseTree: tree.trim(), worktrees };
}

// Performs dated work on main, or `in` a named worktree, answering its
// commits.
export const performIn =
  <Worktree extends string>({ checkout, worktrees }: Places<Worktree>) =>
  <Name extends string>(
    steps: Dated<Name>,
    { in: worktree }: { in?: Worktree | undefined } = {},
  ) =>
    work(
      {
        ...checkout,
        integration:
          worktree === undefined ? checkout.integration : worktrees[worktree],
      },
      typeof steps === "function" ? steps(minutesAgo) : steps,
    );
