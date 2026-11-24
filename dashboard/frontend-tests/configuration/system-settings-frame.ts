import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ProjectSettings } from "../../src/projectConfiguration.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork } from "../navigation/board-work.ts";
import type { SettingsViewport } from "./system-settings-browser.ts";
import { settingsReplies } from "./system-settings-reads.ts";

export const projectChoice = (name: string) =>
  page.getByRole("radio", { name, exact: true });

export const settingsWork = [
  boardWork([]),
  boardWork([], { id: "doughnut", label: "Doughnut" }),
  boardWork([], { id: "pygardon", label: "Pygardon" }),
  boardWork([], { id: "terry-talks", label: "Terry Talks" }),
] as const;

export function projectFacts(
  work: PublishedWork,
  {
    localPath = `/work/${work.source.id}`,
    clientConfiguration = { status: "absent" },
  }: Partial<ProjectSettings> = {},
) {
  return makeMe.aProjectSettings
    .with({ id: work.source.id, localPath, clientConfiguration })
    .please();
}

export function mountSettingsFrame(
  viewport: SettingsViewport,
  work: readonly [PublishedWork, ...PublishedWork[]] = settingsWork,
  {
    view = "stories",
    facts = work.map((project) => projectFacts(project)),
  }: {
    view?: "stories" | "roster";
    facts?: readonly ProjectSettings[];
  } = {},
) {
  const [selected, ...otherWork] = work;
  const sources = settingsReplies({ read: () => Promise.resolve(facts) });
  return mountBoardFrame(
    selected,
    viewport,
    view,
    {},
    {
      otherWork,
      settingsSources: sources,
    },
  ).then(() => sources);
}

export function changePageAddress(query: string) {
  history.pushState(null, "", query ? `?${query}` : location.pathname);
  window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
}
