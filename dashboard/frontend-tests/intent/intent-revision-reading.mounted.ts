// Production Intent mounted on an open published reading, as the reader finds
// and operates it, for the cases that apply a newer revision
// (./intent-revision-*.mounted.spec.ts).
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { expect, onTestFinished, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import "../../src/dashboardStyles.ts";
import { IntentPerspective } from "../../src/IntentPerspective.tsx";
import { IntentPageProviders } from "../../src/intentPageProviders.tsx";
import { IntentReadRecovery } from "../../src/intentReadRecovery.tsx";
import {
  StorySelectionProvider,
  usePageStorySelection,
} from "../../src/pageStorySelection.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { actSettled } from "../../test-support/mounted-dashboard/mountedActSettled.ts";
import {
  featurePath,
  featuresFolder,
  otherPath,
} from "./intent-revision-read-service.mounted.ts";

const source = makeMe.aPublishedSource
  .with({ id: "pygardon", label: "Pygardon", repository: "terryyin/pygardon" })
  .please();
export const short = (revision: string) => revision.slice(0, 7);

export const workAt = (revision: string): PublishedWork =>
  makeMe.aPublishedWork
    .with({
      source,
      revision,
      retrievedAt: new Date("2026-11-05T08:00:00.000Z"),
      direction: "",
      taken: [],
      backlog: [],
    })
    .please();

// The page's story selection and Intent providers around production Intent.
function Reading({ work }: { readonly work: PublishedWork }) {
  const perspective = createElement(IntentPerspective, {
    source,
    work,
    records: [],
    workspaces: [],
  });
  const recovering = createElement(IntentReadRecovery, {
    visibility: "visible",
    limitStands: false,
    children: perspective,
  });
  return createElement(StorySelectionProvider, {
    selection: usePageStorySelection(),
    children: createElement(IntentPageProviders, {
      project: source.id,
      children: recovering,
    }),
  });
}

// Production Intent at the desktop size the built-app journey read it. The
// returned `show` offers another published work to the same reading; each
// render settles with the reads it starts.
export async function mountReading(work: PublishedWork) {
  const [width, height] = [window.innerWidth, window.innerHeight];
  await page.viewport(1280, 600);
  const host = document.body.appendChild(document.createElement("div"));
  // The page frame gives Intent the available viewport, as a column.
  Object.assign(host.style, {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
  });
  const root: Root = createRoot(host);
  onTestFinished(async () => {
    act(() => {
      root.unmount();
    });
    host.remove();
    await page.viewport(width, height);
  });
  const show = (shown: PublishedWork) =>
    actSettled(() => {
      root.render(createElement(Reading, { work: shown }));
    });
  await show(work);
  return show;
}

// Clicks as the reader does, settling what the click starts.
export const click = (target: Locator) =>
  actSettled(() => userEvent.click(target));

// The pane the selected file's reading scrolls in.
const readingPane = () =>
  document.querySelector<HTMLElement>(".intent-reading");

// The mounted Intent reading as a reader finds it.
export function intentReading() {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  // Text as read, without the line breaking hints it renders.
  const readText = (target: Locator) => () =>
    (target.query()?.textContent ?? "").replace(/[\u200B\u00AD]/g, "");
  const sourceText = (path: string) =>
    readText(intent.getByLabelText(`${path} source`, { exact: true }));
  const notice = intent
    .getByRole("status")
    .filter({ hasText: "New revision available" });
  const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
  const retry = { name: "Retry", exact: true } as const;
  // An explanation of unusable settings shown in the reading's place.
  const explanation = { hasText: "Intent locations for" } as const;
  // The tab panel the settings explanation is read in.
  const settingsPanel = intent
    .getByRole("tabpanel")
    .filter({ has: page.getByRole("alert").filter(explanation) });
  const browserRevision = intent.getByLabelText("Test browser revision", {
    exact: true,
  });
  return {
    // The location's disclosure, named Expand or Collapse by its state.
    toggle: intent.getByRole("button", {
      name: new RegExp(`^(Expand|Collapse) ${featuresFolder}$`),
    }),
    feature: intent.getByRole("button", { name: featurePath, exact: true }),
    otherFile: intent.getByRole("button", { name: otherPath, exact: true }),
    // Every file source the reading shows.
    sources: intent.getByLabelText(/ source$/),
    // Files the locations column shows selected.
    pressedFiles: () =>
      document.querySelectorAll('.intent-locations [aria-pressed="true"]'),
    readingPane,
    purpose,
    settingsProblem: intent.getByRole("alert").filter(explanation),
    settingsPanel,
    settingsPanelText: readText(settingsPanel),
    shownSource: sourceText(featurePath),
    otherSource: sourceText(otherPath),
    // The selected file's failed read and its own Retry.
    readFailure: purpose.getByRole("alert"),
    retryRead: purpose.getByRole("button", retry),
    // Waits for the test browser to name the revision the reading shows.
    expectBrowserAt: (revision: string) =>
      expect
        .element(browserRevision)
        .toHaveTextContent(`Test browser at ${short(revision)}`),
    notice,
    noticeText: () => notice.query()?.textContent ?? "",
    noticeButtons: () =>
      notice
        .getByRole("button")
        .elements()
        .map((button) => button.textContent),
    retryUpdate: notice.getByRole("button", retry),
    showLatest: notice.getByRole("button", {
      name: "Show latest",
      exact: true,
    }),
  };
}

// Opens the feature from its collapsed location, as the reader selects it.
export async function openFeature(reading: ReturnType<typeof intentReading>) {
  await expect
    .element(reading.toggle)
    .toHaveAttribute("aria-expanded", "false");
  await click(reading.toggle);
  await click(reading.feature);
}

// Scrolls the reading pane halfway, answering the offset it reached.
export async function scrollReadingHalfway() {
  const pane = readingPane();
  if (pane === null) throw new Error("Intent shows no reading pane");
  const most = pane.scrollHeight - pane.clientHeight;
  expect(most).toBeGreaterThan(40);
  await actSettled(() => {
    pane.scrollTo({ top: Math.floor(most / 2) });
  });
  await vi.waitUntil(() => pane.scrollTop > 20);
  return { pane, scrolled: pane.scrollTop };
}
