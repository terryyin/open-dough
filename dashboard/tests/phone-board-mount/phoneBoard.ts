import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { onTestFinished, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { App } from "../../src/App.tsx";
import "../../src/dashboardStyles.ts";
import { answerPhoneBoardServices } from "./phoneBoardServices.ts";
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
  const original = viewport();
  if (
    original.width !== portrait.width ||
    original.height !== portrait.height
  ) {
    await page.viewport(portrait.width, portrait.height);
  }
  const publication = await commands.phoneBoardPublication(
    options.backlog === "long",
  );
  const { boardPositionKey } = publication;
  const storage = Object.entries<string>(localStorage);
  localStorage.clear();
  localStorage.setItem(boardPositionKey, "0");
  const url = location.href;
  const historyState: unknown = history.state;
  history.replaceState(null, "", "/");

  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const browserMedia = window.matchMedia.bind(window);
  const media = vi.spyOn(window, "matchMedia").mockImplementation((query) => {
    const answer = browserMedia(query);
    return query === "(prefers-reduced-motion: reduce)"
      ? (Object.create(answer, {
          matches: { value: options.reducedMotion === "reduce" },
        }) as MediaQueryList)
      : answer;
  });
  const measure = controlResize();
  const launchAcceptances = answerPhoneBoardServices(publication.answers);

  const container = document.createElement("div");
  container.id = "root";
  const animationClock = document.createElement("style");
  animationClock.textContent =
    "#root .board-row { transition-duration: 0s !important; }";
  document.body.append(animationClock, container);
  let root: Root | undefined;
  onTestFinished(async () => {
    try {
      act(() => root?.unmount());
    } finally {
      container.remove();
      animationClock.remove();
      media.mockRestore();
      vi.unstubAllGlobals();
      vi.useRealTimers();
      localStorage.clear();
      for (const [key, value] of storage) localStorage.setItem(key, value);
      history.replaceState(historyState, "", url);
      if (
        viewport().width !== original.width ||
        viewport().height !== original.height
      ) {
        await page.viewport(original.width, original.height);
      }
    }
  });
  await act(() => {
    root = createRoot(container);
    root.render(createElement(App));
    return Promise.resolve();
  });
  if (!container.querySelector(".board-row"))
    throw new Error(
      `Expected the mounted board: ${container.textContent.trim()}`,
    );
  const resize = async (width: number, height: number) => {
    await act(async () => {
      await page.viewport(width, height);
      measure();
    });
    return viewport();
  };
  return {
    ...phoneBoardPage(container, publication.titles),
    readyStory: publication.readyStory,
    launchAcceptances,
    resize,
    viewport,
  };
}
