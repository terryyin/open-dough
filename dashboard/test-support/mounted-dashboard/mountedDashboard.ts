import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { onTestFinished, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { App } from "../../src/App.tsx";
import "../../src/dashboardStyles.ts";
import type { MountedServiceAnswers } from "../support/mountedDashboardCommands.ts";
import { actSettled } from "./mountedActSettled.ts";
import { answerMountedServices } from "./mountedServices.ts";

async function showViewport({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  if (window.innerWidth !== width || window.innerHeight !== height)
    await page.viewport(width, height);
}

type MountedCase = {
  teardowns: (() => Promise<void> | void)[];
  unanswered: string[][];
};
let mountedCase: MountedCase | undefined;

// The case this mount belongs to. Its first mount remembers the page as the
// case found it; one hook after the case ends every mount, then restores it.
function joinMountedCase(): MountedCase {
  if (mountedCase) return mountedCase;
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const storage = Object.entries<string>(localStorage);
  const url = location.href;
  const historyState: unknown = history.state;
  const joined: MountedCase = { teardowns: [], unanswered: [] };
  mountedCase = joined;
  onTestFinished(async () => {
    mountedCase = undefined;
    try {
      for (const teardown of joined.teardowns.reverse()) await teardown();
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
      localStorage.clear();
      for (const [key, value] of storage) localStorage.setItem(key, value);
      history.replaceState(historyState, "", url);
      await showViewport(viewport);
    }
    const unanswered = joined.unanswered.flat();
    if (unanswered.length > 0)
      throw new Error(`Unanswered mounted requests: ${unanswered.join(", ")}`);
  });
  return joined;
}

export async function mountAnsweredDashboard(options: {
  answers: MountedServiceAnswers;
  boardPositionKey: string;
  arrange?: () => void;
  restore?: () => Promise<void> | void;
  style?: string;
  // The viewport the case mounts at; the original returns at cleanup.
  viewport?: { width: number; height: number };
}) {
  const mounted = joinMountedCase();
  if (options.viewport) await showViewport(options.viewport);
  localStorage.clear();
  localStorage.setItem(options.boardPositionKey, "0");
  history.replaceState(null, "", "/");

  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  options.arrange?.();
  const services = answerMountedServices(options.answers);

  const container = document.createElement("div");
  container.id = "root";
  const style = document.createElement("style");
  style.textContent = options.style ?? "";
  document.body.append(style, container);
  let root: Root | undefined;
  const unmount = () => {
    try {
      act(() => root?.unmount());
    } finally {
      root = undefined;
      container.remove();
      style.remove();
    }
  };
  mounted.unanswered.push(services.unanswered);
  mounted.teardowns.push(async () => {
    try {
      unmount();
    } finally {
      await options.restore?.();
    }
  });
  await actSettled(() => {
    root = createRoot(container);
    root.render(createElement(App));
  });
  return {
    container,
    launchAcceptances: services.launchAcceptances,
    boardRows: () => container.querySelectorAll(".board-row").length,
    // The banner's connection state, as its `data-connection` names it.
    connection: () =>
      container.querySelector(".banner")?.getAttribute("data-connection"),
    // Leaves the page, as a case that mounts the board again after it.
    unmount,
  };
}

export async function mountDefaultDashboard() {
  const { answers, boardPositionKey } =
    await commands.dashboardServiceAnswers();
  return mountAnsweredDashboard({ answers, boardPositionKey });
}
