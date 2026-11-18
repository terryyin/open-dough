import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { onTestFinished, vi } from "vitest";
import { commands } from "vitest/browser";
import { App } from "../../src/App.tsx";
import "../../src/dashboardStyles.ts";
import type { MountedServiceAnswers } from "../support/mountedDashboardCommands.ts";
import {
  answerMountedServices,
  answersStillHeld,
  endHeldAnswers,
} from "./mountedServices.ts";

export async function mountAnsweredDashboard(options: {
  answers: MountedServiceAnswers;
  boardPositionKey: string;
  held?: readonly string[];
  arrange?: () => void;
  restore?: () => Promise<void> | void;
  style?: string;
}) {
  const earlier = answersStillHeld();
  if (earlier.length > 0)
    throw new Error(`Answers held by an earlier case: ${earlier.join(", ")}`);
  const storage = Object.entries<string>(localStorage);
  localStorage.clear();
  localStorage.setItem(options.boardPositionKey, "0");
  const url = location.href;
  const historyState: unknown = history.state;
  history.replaceState(null, "", "/");

  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  options.arrange?.();
  const services = answerMountedServices(options.answers, options.held);

  const container = document.createElement("div");
  container.id = "root";
  const style = document.createElement("style");
  style.textContent = options.style ?? "";
  document.body.append(style, container);
  let root: Root | undefined;
  onTestFinished(async () => {
    try {
      act(() => root?.unmount());
    } finally {
      container.remove();
      style.remove();
      endHeldAnswers();
      vi.unstubAllGlobals();
      vi.useRealTimers();
      localStorage.clear();
      for (const [key, value] of storage) localStorage.setItem(key, value);
      history.replaceState(historyState, "", url);
      await options.restore?.();
    }
    if (services.unanswered.length > 0)
      throw new Error(
        `Unanswered mounted requests: ${services.unanswered.join(", ")}`,
      );
  });
  await act(() => {
    root = createRoot(container);
    root.render(createElement(App));
    return Promise.resolve();
  });
  return {
    container,
    launchAcceptances: services.launchAcceptances,
    answersStillHeld,
    boardRows: () => container.querySelectorAll(".board-row").length,
  };
}

export async function mountDefaultDashboard(held: readonly string[] = []) {
  const { answers, boardPositionKey } =
    await commands.dashboardServiceAnswers();
  return mountAnsweredDashboard({ answers, boardPositionKey, held });
}
