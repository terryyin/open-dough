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

// The mounted Intent reading as a reader finds it.
export function intentReading() {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const featureSource = intent.getByLabelText(`${featurePath} source`, {
    exact: true,
  });
  const notice = intent
    .getByRole("status")
    .filter({ hasText: "New revision available" });
  return {
    // The location's disclosure, named Expand or Collapse by its state.
    toggle: intent.getByRole("button", {
      name: new RegExp(`^(Expand|Collapse) ${featuresFolder}$`),
    }),
    feature: intent.getByRole("button", { name: featurePath, exact: true }),
    // The source as read, without the line breaking hints it renders.
    shownSource: () =>
      (featureSource.query()?.textContent ?? "").replace(/[\u200B\u00AD]/g, ""),
    browserRevision: intent.getByLabelText("Test browser revision", {
      exact: true,
    }),
    notice,
    noticeText: () => notice.query()?.textContent ?? "",
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
  const pane = document.querySelector<HTMLElement>(".intent-reading");
  if (pane === null) throw new Error("Intent shows no reading pane");
  const most = pane.scrollHeight - pane.clientHeight;
  expect(most).toBeGreaterThan(40);
  await actSettled(() => {
    pane.scrollTo({ top: Math.floor(most / 2) });
  });
  await vi.waitUntil(() => pane.scrollTop > 20);
  return { pane, scrolled: pane.scrollTop };
}
