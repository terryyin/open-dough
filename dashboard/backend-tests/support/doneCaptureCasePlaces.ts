// Where a Done capture case's launches start and its work happens: the
// materialized checkout and its named worktrees by the
// canonical paths Git registers. Lives beside ./doneCaptureCaseBuilder.ts.
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import { type WorkCheckout, minutesAgo, work } from "./doneCaptureCase.ts";

export type Places<Worktree extends string = string> = {
  checkout: WorkCheckout & { base: string; gitDirectory: string };
  worktrees: Record<Worktree, string>;
  // The declared worktree on `branch`, rejecting any other by its name.
  worktree: (branch: string) => string;
};

// Work steps stated directly, or dated `at` minutes before the case's clock.
export type Dated<Name extends string> =
  | CheckoutWorkBuilder<Name>
  | ((at: typeof minutesAgo) => CheckoutWorkBuilder<Name>);

// The checkout's places, as Git resolves them, holding each `declared`
// worktree.
export async function placesOf<Worktree extends string>(
  checkout: Places["checkout"],
  declared: readonly string[],
): Promise<Places<Worktree>> {
  const { stdout: listed } = await git(
    checkout.integration,
    "worktree",
    "list",
    "--porcelain",
  );
  const worktrees: Record<string, string> = {};
  for (const entry of listed.split("\n\n")) {
    const at = /^worktree (.+)$/m.exec(entry)?.[1];
    const branch = /^branch refs\/heads\/(.+)$/m.exec(entry)?.[1];
    if (at !== undefined && branch !== undefined && declared.includes(branch))
      worktrees[branch] = at;
  }
  const worktree = (branch: string) => {
    const at = worktrees[branch];
    if (at === undefined)
      throw new Error(`Undeclared or unmaterialized worktree: ${branch}`);
    return at;
  };
  return { checkout, worktrees, worktree };
}

// Performs dated work on main, or `in` a named worktree, answering its
// commits.
export const performIn =
  <Worktree extends string>({ checkout, worktree: at }: Places<Worktree>) =>
  <Name extends string>(
    steps: Dated<Name>,
    { in: worktree }: { in?: Worktree | undefined } = {},
  ) =>
    work(
      {
        ...checkout,
        integration:
          worktree === undefined ? checkout.integration : at(worktree),
      },
      typeof steps === "function" ? steps(minutesAgo) : steps,
    );
