import { act } from "react";
import { vi } from "vitest";
import { commands, page } from "vitest/browser";
import { mountAnsweredDashboard } from "../mounted-dashboard/mountedDashboard.ts";
import { phoneBoardPage } from "./phoneBoardPage.ts";

const portrait = { width: 390, height: 844 };
const viewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

function controlResize() {
  const observers = new Set<ControlledResizeObserver>();
  class ControlledResizeObserver implements ResizeObserver {
    private readonly targets = new Set<Element>();

    constructor(private readonly changed: ResizeObserverCallback) {}
    observe(element: Element) {
      this.targets.add(element);
      observers.add(this);
    }
    unobserve(element: Element) {
      this.targets.delete(element);
      if (this.targets.size === 0) observers.delete(this);
    }
    disconnect() {
      this.targets.clear();
      observers.delete(this);
    }
    measure() {
      this.changed([], this);
    }
  }
  vi.stubGlobal("ResizeObserver", ControlledResizeObserver);
  return () => {
    for (const observer of [...observers]) observer.measure();
  };
}

export async function mountPhoneBoard(
  options: {
    backlog?: "long";
    reducedMotion?: "reduce";
  } = {},
) {
  const publication = await commands.phoneBoardPublication(
    options.backlog === "long",
  );
  let measure = () => {};
  let media: { mockRestore: () => void } | undefined;
  const dashboard = await mountAnsweredDashboard({
    answers: publication.answers,
    boardPositionKey: publication.boardPositionKey,
    viewport: portrait,
    style: "#root .board-row { transition-duration: 0s !important; }",
    arrange: () => {
      const browserMedia = window.matchMedia.bind(window);
      media = vi.spyOn(window, "matchMedia").mockImplementation((query) => {
        const answer = browserMedia(query);
        return query === "(prefers-reduced-motion: reduce)"
          ? (Object.create(answer, {
              matches: { value: options.reducedMotion === "reduce" },
            }) as MediaQueryList)
          : answer;
      });
      measure = controlResize();
    },
    restore: () => media?.mockRestore(),
  });
  if (dashboard.boardRows() === 0)
    throw new Error(
      `Expected the mounted board: ${dashboard.container.textContent.trim()}`,
    );
  const resize = async (width: number, height: number) => {
    await act(async () => {
      await page.viewport(width, height);
      measure();
    });
    return viewport();
  };
  return {
    ...phoneBoardPage(dashboard.container, publication.titles),
    readyStory: publication.readyStory,
    launchAcceptances: dashboard.launchAcceptances,
    resize,
    viewport,
  };
}
