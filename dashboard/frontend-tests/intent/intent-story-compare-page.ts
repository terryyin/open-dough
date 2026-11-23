// The selected story in a mounted Intent view
// (./intent-story-compare-stories.ts) as a reader meets its comparison: the
// header's revisions line and its Compare group (the comparison choice, the
// story's commits, the uncommitted check, Refresh and the range read), the
// story's views, the Changes file list and the selected file's diff.
import { page, userEvent } from "vitest/browser";

const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const textOf = (element: Element | null | undefined) =>
  element?.textContent ?? "";

// A listed file's control is named by its kind and path.
const fileNamed = (name: string) => ({
  name: new RegExp(`^${escaped(name)}(?:,|$)`),
});

export function intentStoryCompare() {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const header = intent.getByRole("region", {
    name: "Selected story",
    exact: true,
  });
  const compare = header.getByRole("group", { name: "Compare" });
  const commits = compare.getByRole("list", { name: "Story commits" });
  const commit = (subject: string) =>
    commits.getByRole("button").filter({ hasText: subject });
  const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
  const run = compare.getByRole("listbox", { name: "Landed run" });
  type View = "Changes" | "CI comparison" | "Intent coverage";
  const view = (name: View) =>
    intent.getByRole("tabpanel", { name, exact: true });
  const proof = intent.getByRole("region", { name: "Proof", exact: true });
  type CiView = "CI comparison" | "Intent coverage" | "Proof";
  const ciView = (name: CiView) => (name === "Proof" ? proof : view(name));
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
    run,
    chooseRun: (key: string) => userEvent.selectOptions(run, key),
    // The story's changed files outside every location.
    outside: () => textOf(outsideGroup.query()),
    // A CI view's text, Proof that of the selected file's Proof tab.
    viewText: (name: CiView) => textOf(ciView(name).element()),
    // What a CI view says while another comparison than the default is
    // chosen: the whole-story note, and the build its `code` names.
    noteIn: (name: CiView) =>
      ciView(name).element().querySelector('[role="note"]')?.textContent ??
      null,
    noteBuild: (name: CiView) =>
      ciView(name).element().querySelector('[role="note"] code')?.textContent ??
      null,
    // Chooses the selected file's Proof tab.
    chooseProof: () =>
      userEvent.click(
        intent
          .getByRole("tablist", { name: "Purpose and Proof", exact: true })
          .getByRole("tab", { name: "Proof", exact: true }),
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
        view("CI comparison")
          .element()
          .querySelectorAll(".intent-ci-comparison-identity")[2],
      ),
    // Comparison facts can expand independently of the header.
    collapsedControl: header.getByRole("button", {
      expanded: false,
      name: /^(?!Branch )/,
    }),
    workspaceContext: header.getByRole("button", { name: /^Branch / }),
    revisions: () =>
      textOf(header.element().querySelector(".intent-story-revisions")),
    choice: (name: string) => compare.getByRole("radio", { name }),
    choose: (name: string) =>
      userEvent.click(compare.getByRole("radio", { name })),
    includeUncommitted: compare.getByRole("checkbox", {
      name: "Include uncommitted changes",
    }),
    refreshButton: compare.getByRole("button", { name: "Refresh" }),
    refresh: () =>
      userEvent.click(compare.getByRole("button", { name: "Refresh" })),
    commits,
    commit,
    // Chooses `subject` as both ends of the range.
    async chooseAlone(subject: string) {
      await userEvent.click(commit(subject));
      await userEvent.click(commit(subject));
    },
    range: () =>
      textOf(header.element().querySelector(".story-review-range-heading")),
    chooseTab: (name: View) =>
      userEvent.click(
        intent
          .getByRole("tablist", { name: "Selected story views" })
          .getByRole("tab", { name, exact: true }),
      ),
    // A listed file's control, named by its kind and path.
    file: (name: string) => intent.getByRole("button", fileNamed(name)),
    purposeText: () => textOf(purpose.element()),
    diffName: () =>
      textOf(
        purpose.element().querySelector(".story-review-diff-heading h3"),
      ).trim(),
    diffCode: () =>
      textOf(purpose.element().querySelector(".story-review-code")),
  };
}
