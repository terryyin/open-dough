import { expect } from "../dashboardTest.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { shortRevision, parts } from "../dashboardPage.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import { openUntilRead, reloadUntilRead } from "../pageRequestNotes.ts";
import { consumer, test, twoDependencies } from "../storyDependencyFixture.ts";
import { storyCard } from "../storyCardControls.ts";
import { expectBadges } from "../storyCardFacts.ts";

test("malformed and unreadable dependency facts block execution without blocking refinement", async ({
  page,
  origin,
}) => {
  // Story A's Ready seed with both agreements, whose published dependency
  // block is not valid JSON.
  const dependencies = twoDependencies();
  const seed = ".planning/seeds/A.md";
  const revision = await origin.publishRevision({
    message: "Publish malformed dependency facts",
    files: {
      ...dependencies.files,
      [seed]: String(dependencies.files?.[seed]).replace(
        /```json dough-story-dependencies\n[^\n]+/,
        "```json dough-story-dependencies\n{broken",
      ),
    },
  });
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const releaseCanonical = published.hold(".planning/seeds/A.md");
  await openUntilRead(page);
  const card = storyCard(parts(page).backlog, consumer.title);
  const execution = card.getByRole("button", { name: "Start execution" });
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(
    /dependency facts are being read/,
  );
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  releaseCanonical();
  await expect(card).toContainText(
    "Dependency facts unavailable: Story dependencies: present dependency block is not valid JSON.",
  );
  // The recorded Ready assessment cannot look eligible behind the gap.
  await expectBadges(card, {
    shown: ["Slice planned"],
    absent: ["Ready for execution"],
  });
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(
    /dependency facts could not be read/,
  );
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  const unreadRevision = await origin.publishRevision({
    files: {
      ".planning/observed-change.md": "Force a newly pinned observation.\n",
    },
  });
  published.answerWith(".planning/seeds/A.md", notFoundAnswer());
  await reloadUntilRead(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(unreadRevision),
  );
  await expect(card.locator(".dependency-problem")).not.toContainText(
    "not valid JSON",
  );
  await expect(card.locator(".dependency-problem")).toContainText(
    "Dependency facts unavailable",
  );
  await expect(execution).toBeDisabled();
  await expect(
    card.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
});
