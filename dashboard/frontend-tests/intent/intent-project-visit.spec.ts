// The story keeps its reading across tabs. A project candidate reads published
// source and returns focus within its own view.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { intentCandidates, intentViewTab } from "./intent-candidates-page.ts";
import { filesColumnVisible } from "./intent-ci-homepage-page.ts";
import { chooseWholeProject } from "./intent-recent-stories-page.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  candidatePath,
  changed,
  deepSpec,
  intent,
  intentContext,
  mountProjectVisit,
  selectTakenStoryInIntent,
  story,
} from "./intent-project-visit-fixtures.ts";

const purposeProof = () =>
  intent.getByRole("tablist", { name: "Purpose and Proof", exact: true });

test("the story retains its reading across tabs, and its candidate's project source is published and returns focus", async () => {
  const { reads } = await mountProjectVisit();
  await selectTakenStoryInIntent();
  await story.file(deepSpec).click();
  await expect.poll(story.diffCode).toContain("long 120");
  const offset = await story.scrollReadingHalfway();
  await story.chooseTab("Intent coverage");
  await story.chooseTab("Changes");
  await expect
    .element(story.viewTab("Changes"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(story.file(deepSpec))
    .toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => story.readingOffset()).toBe(offset);

  await story.file(changed.modified).click();
  await expect.poll(story.diffName).toBe(changed.modified);
  await story.chooseProof();
  const storyCiLink = page
    .getByRole("region", { name: "Proof", exact: true })
    .getByRole("button", { name: "View story CI comparison" });
  await expect.element(storyCiLink).toBeVisible();

  await story.chooseTab("CI comparison");
  await story.chooseTab("Changes");
  await expect
    .element(story.file(changed.modified))
    .toHaveAttribute("aria-pressed", "true");
  await expect
    .element(purposeProof().getByRole("tab", { name: "Proof", exact: true }))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(storyCiLink).toBeVisible();
  await userEvent.click(
    purposeProof().getByRole("tab", { name: "Purpose", exact: true }),
  );
  await expect.poll(story.diffName).toBe(changed.modified);

  await chooseWholeProject();
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await expect.poll(intentContext).toBe("project");
  await intentCiStatus().judges("main");
  await expect.poll(filesColumnVisible).toBe(true);
  const candidates = intentCandidates();
  await candidates.choose();
  const entry = candidates.entry("a-spec-cost");
  await expect
    .poll(() =>
      candidates.record.element().getAttribute("data-candidates-reads"),
    )
    .toMatch(/^[1-9]\d*$/);
  const readsBefore =
    candidates.record.element().getAttribute("data-candidates-reads") ?? "";

  const reading = await candidates.openSource("a-spec-cost", candidatePath);
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(purposeProof().getByRole("tab", { name: "Purpose", exact: true }))
    .toHaveAttribute("aria-selected", "true");
  await reading.shows("a 11");
  await expect
    .poll(
      () =>
        page
          .getByLabelText(`${candidatePath} source`, { exact: true })
          .element().textContent,
    )
    .not.toContain("more");
  await expect.poll(story.diffName).toBe("");
  await expect
    .element(intent.getByRole("button", { name: candidatePath, exact: true }))
    .toHaveAttribute("aria-pressed", "true");
  await story.chooseProof();
  await expect
    .element(page.getByRole("region", { name: "Proof", exact: true }))
    .toBeVisible();
  await expect
    .element(intent.getByRole("button", { name: "View story CI comparison" }))
    .not.toBeInTheDocument();

  await userEvent.click(intentViewTab("Optimization Candidates"));
  await expect.element(entry).toHaveFocus();
  await expect
    .element(candidates.record)
    .toHaveAttribute("data-candidates-reads", readsBefore);

  const ciTab = intentViewTab("CI status");
  intentViewTab("Optimization Candidates").element().focus();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(ciTab).toHaveFocus();
  await expect
    .element(intent.getByRole("button", { name: candidatePath, exact: true }))
    .toHaveAttribute("aria-pressed", "true");
  await expect
    .element(page.getByRole("region", { name: "Proof", exact: true }))
    .toBeVisible();
  await userEvent.keyboard("{Enter}");
  await intentCiStatus().judges("main");
  await expect.element(purposeProof()).not.toBeInTheDocument();
  expect(reads).toEqual(["candidates", `text ${candidatePath}`]);
});
