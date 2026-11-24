// The selected story in a mounted Intent view
// (./intent-story-compare-stories.ts) as a reader meets its comparison: the
// header's revisions line and its Compare group (the comparison choice, the
// story's commits, the uncommitted check, Refresh and the range read), the
// story's views, the Changes file list, its folders and "Selected story
// only" filter, and the selected file's diff in the reading pane.
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import "../page-objects/cssLocator.ts";
import {
  intentReadingPane as readingPane,
  scrollReadingHalfway,
} from "./intent-browser-page.ts";

const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const textOf = (element: Element | null | undefined) =>
  element?.textContent ?? "";

// A listed file's control is named by its kind and path.
const fileNamed = (name: string) => ({
  name: new RegExp(`^${escaped(name)}(?:,|$)`),
});

// These cases exercise the response to activation. Keyboard and pointer
// behavior use browser input in the cases that exercise those interactions.
export async function activateComparisonControl(control: Locator) {
  await expect
    .poll(
      () => control.query()?.matches(":enabled:not([aria-disabled='true'])"),
      { interval: 5 },
    )
    .toBe(true);
  (control.element() as HTMLElement).click();
}

export const comparisonRead = <T>(read: () => T) =>
  expect.poll(read, { interval: 5 });

export function intentStoryCompare() {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const header = intent.getByRole("region", {
    name: "Selected story",
    exact: true,
  });
  const compare = header.getByRole("group", { name: "Compare" });
  const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
  const landingChoices = compare.getByRole("radio", { name: / — / });
  const runChoice = (key: string) =>
    landingChoices.and(page.getByCSS(`[value="${CSS.escape(key)}"]`));
  type View = "Changes" | "CI comparison" | "Intent coverage";
  const storyViews = intent.getByRole("tablist", {
    name: "Selected story views",
  });
  const viewTab = (name: View) =>
    storyViews.getByRole("tab", { name, exact: true });
  const view = (name: View) => {
    const id = viewTab(name).query()?.getAttribute("aria-controls");
    return id === undefined || id === null ? null : document.getElementById(id);
  };
  const proof = intent.getByRole("region", { name: "Proof", exact: true });
  const fileTabs = intent.getByRole("tablist", {
    name: "Purpose and Proof",
    exact: true,
  });
  type CiView = "CI comparison" | "Intent coverage" | "Proof";
  const ciView = (name: CiView) =>
    name === "Proof"
      ? intent.query()?.querySelector(".intent-proof")
      : view(name);
  const alert = header.getByRole("alert");
  const retryControl = alert.getByRole("button", { name: "Retry" });
  const outsideGroup = intent.getByRole("region", {
    name: "Outside Intent locations",
  });
  return {
    header,
    filesToggle: intent.getByRole("button", { name: /^(Hide|Show) files$/ }),
    headerText: () => textOf(header.element()),
    // A chosen comparison that cannot be read, with Retry after a failed read.
    alert,
    alertText: () => alert.query()?.textContent.trim(),
    retry: () => userEvent.click(retryControl),
    retryControl,
    // The captured landed run chosen, offered with Landed runs.
    landingChoices,
    runChoice,
    chooseRun: (key: string) => activateComparisonControl(runChoice(key)),
    chooseLatestLanding: () =>
      activateComparisonControl(landingChoices.first()),
    // The story's changed files outside every location.
    outsideGroup,
    outside: () => textOf(outsideGroup.query()),
    onlyChangedFiles: intent.getByRole("checkbox", {
      name: "Selected story only",
      exact: true,
    }),
    projectIntent: intent.getByRole("button", {
      name: "Project Intent",
      exact: true,
    }),
    backToStory: intent.getByRole("button", {
      name: "Back to selected story",
      exact: true,
    }),
    // A CI view's text, Proof that of the selected file's Proof tab.
    viewText: (name: CiView) => textOf(ciView(name)),
    // What a CI view says while another comparison than the default is
    // chosen: the whole-story note, and the build its `code` names.
    noteIn: (name: CiView) =>
      ciView(name)?.querySelector('[role="note"]')?.textContent ?? null,
    noteBuild: (name: CiView) =>
      ciView(name)?.querySelector('[role="note"] code')?.textContent ?? null,
    // Chooses the selected file's Proof tab.
    chooseProof: () =>
      activateComparisonControl(
        fileTabs.getByRole("tab", { name: "Proof", exact: true }),
      ),
    choosePurpose: () =>
      activateComparisonControl(
        fileTabs.getByRole("tab", { name: "Purpose", exact: true }),
      ),
    // A changed file outside every location, by its kind and path.
    outsideFile: (name: string) =>
      outsideGroup.getByRole("button", fileNamed(name)),
    // The CI comparison identity labels Proof reads for `identity`.
    proofLabels: (identity: string) =>
      [
        ...proof
          .getByRole("list", {
            name: `CI timing comparison of ${identity}`,
            exact: true,
          })
          .element()
          .querySelectorAll("li"),
      ].map(textOf),
    // The CI comparison's landed endpoint, its third measured build.
    landedEndpoint: () =>
      textOf(
        view("CI comparison")?.querySelectorAll(
          ".intent-ci-comparison-identity",
        )[2],
      ),
    // How many of Intent's controls are pressed, as a selected file is.
    pressedControlCount: () =>
      intent.element().querySelectorAll('[aria-pressed="true"]').length,
    // Comparison facts can expand independently of the header.
    collapsedControl: header.getByRole("button", {
      expanded: false,
      name: /^(?!Branch )/,
    }),
    revisions: () =>
      textOf(header.element().querySelector(".intent-story-revisions")),
    choice: (name: string) => compare.getByRole("radio", { name }),
    choose: (name: string) =>
      activateComparisonControl(compare.getByRole("radio", { name })),
    includeMerged: compare.getByRole("checkbox", {
      name: "Include merged changes",
    }),
    refreshButton: compare.getByRole("button", { name: "Refresh" }),
    refresh: () =>
      userEvent.click(compare.getByRole("button", { name: "Refresh" })),
    viewTab,
    chooseTab: (name: View) => activateComparisonControl(viewTab(name)),
    // A listed file's control, named by its kind and path.
    file: (name: string) => intent.getByRole("button", fileNamed(name)),
    // A location's or folder's toggle, by its name and whether it is open.
    folderToggle: (name: string, open: boolean) =>
      intent.getByRole("button", {
        name: `${open ? "Collapse" : "Expand"} ${name}`,
        exact: true,
      }),
    readingShown: () => readingPane()?.checkVisibility() ?? false,
    readingText: () => textOf(readingPane()),
    readingOffset: () => readingPane()?.scrollTop,
    scrollReadingHalfway,
    purposeText: () => textOf(purpose.element()),
    diffName: () =>
      textOf(
        purpose.element().querySelector(".story-review-diff-heading h3"),
      ).trim(),
    diffCode: () =>
      textOf(purpose.element().querySelector(".story-review-code")),
  };
}
