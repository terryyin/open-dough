// The selected story in a mounted Intent view
// (./intent-story-compare-stories.ts) as a reader meets its comparison: the
// header's comparison summary, the details its eye reveals (the revisions
// and Refresh), its Compare group (the comparison choice, the story's commits,
// the uncommitted check and the range read), Story Home's evidence tabs,
// and the file list, folders, filter and diff in the story browser.
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import "../page-objects/cssLocator.ts";
import {
  intentReadingPane as readingPane,
  scrollReadingHalfway,
} from "./intent-browser-page.ts";
import { fileLayout } from "./intent-file-layout-page.ts";

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
  type View = "CI comparison" | "Intent coverage";
  const storyViews = intent.getByRole("tablist", {
    name: "Story Home",
  });
  const viewTab = (name: View) =>
    storyViews.getByRole("tab", { name, exact: true });
  const sidebar = intent.getByCSS(".intent-locations");
  const home = intent.getByRole("button", { name: "Home", exact: true });
  const pathReading = intent.getByRole("region", { name: "Path reading" });
  // Files shown without choosing a path, opening its drawer where the page
  // is narrow: each newly entered view starts it closed, and choosing a file
  // closes it.
  const browseFiles = () => fileLayout().showFiles();
  const goHome = async () => {
    await browseFiles();
    await activateComparisonControl(home);
  };
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
  const tree = intent.getByRole("list", {
    name: "Repository files",
    exact: true,
  });
  const folder = (path: string) =>
    tree.getByCSS(`li[data-folder-path="${CSS.escape(path)}"]`);
  const summary = header.getByRole("group", { name: "Comparison summary" });
  const details = header.getByRole("group", { name: "Review details" });
  const refreshButton = details.getByRole("button", { name: "Refresh" });
  // The summary's eye, by the name it has now.
  const detailsEye = (shown: boolean) =>
    summary.getByRole("button", {
      name: `${shown ? "Hide" : "Show"} review details`,
      exact: true,
    });
  // The eye is reached past an open Files drawer, which closes first.
  const openDetails = async () => {
    await fileLayout().uncoverReader();
    const eye = detailsEye(false);
    if (eye.query() !== null) await userEvent.click(eye);
    await expect.element(details).toBeVisible();
  };
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
    tree,
    treeText: () => textOf(tree.query()),
    folder,
    async expandFolderPath(path: string) {
      await browseFiles();
      let ancestor = "";
      for (const segment of path.split("/")) {
        ancestor = ancestor ? `${ancestor}/${segment}` : segment;
        const toggle = folder(ancestor).getByCSS(
          ":scope > div > button[aria-expanded]",
        );
        await expect.element(toggle).toBeVisible();
        if (toggle.element().getAttribute("aria-expanded") === "false")
          await userEvent.click(toggle);
        await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
      }
    },
    onlyChangedFiles: intent.getByRole("checkbox", {
      name: "Selected story only",
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
    // Comparison facts can expand independently of the header, apart from
    // the summary's eye and the Files toggle, whose drawer starts closed.
    collapsedControl: header.getByRole("button", {
      expanded: false,
      name: /^(?!Branch |Show review details$|Show files$)/,
    }),
    revisions: () =>
      textOf(header.element().querySelector(".intent-story-revisions")),
    choice: (name: string) => compare.getByRole("radio", { name }),
    choose: (name: string) =>
      activateComparisonControl(compare.getByRole("radio", { name })),
    includeMerged: compare.getByRole("checkbox", {
      name: "Include merged changes",
    }),
    // The summary's eye and the details it reveals; opening shows the
    // details, holding Refresh.
    detailsEye,
    openDetails,
    details,
    detailsText: () => textOf(details.query()),
    summary,
    // The summary's words, without its eye's tooltip.
    summaryText: () =>
      [
        ...(summary
          .query()
          ?.querySelectorAll(
            ":scope > :not([aria-controls], :has([aria-controls]))",
          ) ?? []),
      ]
        .map(textOf)
        .join(" ")
        .trim(),
    // The words the summary's agent portrait sits beside, or undefined
    // while the summary shows no portrait.
    summaryPortraitBeside: () => {
      const portrait = summary.query()?.querySelector(".agent-portrait");
      return portrait ? textOf(portrait.parentElement).trim() : undefined;
    },
    refreshButton,
    refresh: async () => {
      await openDetails();
      await userEvent.click(refreshButton);
    },
    viewTab,
    chooseTab: async (name: View) => {
      if (pathReading.query() !== null) await goHome();
      await activateComparisonControl(viewTab(name));
    },
    browseFiles,
    goHome,
    home,
    pathReading,
    sidebar,
    homeReading: intent.getByCSS(".intent-story-home"),
    // A listed file's control, named by its kind and path.
    file: (name: string) => sidebar.getByRole("button", fileNamed(name)),
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
        purpose.query()?.querySelector(".story-review-diff-heading h3"),
      ).trim(),
    diffCode: () =>
      textOf(purpose.element().querySelector(".story-review-code")),
  };
}
