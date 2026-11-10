// Reader input simplification must never silently discard variant history.
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import type { CompletedStoryOptions } from "../../tests/support/completedStoryInput.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

test("ordinary trunk completion input rejects incompatible histories before changing the origin", async ({
  origin,
}) => {
  const refs = git(
    origin.origin,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
  );
  const checkout = git(origin.project, "status", "--porcelain");
  const histories: {
    mode?: "trunk" | "story-branch";
    variant?: "takeover";
    integrate?: (workspace: string) => void;
    options?: CompletedStoryOptions;
  }[] = [
    { mode: "story-branch" },
    { variant: "takeover" },
    {
      integrate: () => {
        throw new Error("Unexpected integration work");
      },
    },
    { options: { sharedAlreadyReady: true } },
    {
      options: {
        beforeComplete: () => {
          throw new Error("Unexpected completion work");
        },
      },
    },
  ];
  for (const history of histories) {
    await expect(
      completedPublishedStory(
        origin,
        history.mode ?? "trunk",
        history.variant,
        undefined,
        history.integrate,
        { ...history.options, interleaved: false },
      ),
    ).rejects.toThrow("requires ordinary Trunk Mode");
    expect(
      git(origin.origin, "for-each-ref", "--format=%(refname) %(objectname)"),
    ).toBe(refs);
    expect(git(origin.project, "status", "--porcelain")).toBe(checkout);
  }
});
