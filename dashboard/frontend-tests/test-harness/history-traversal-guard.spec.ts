import { expect, test } from "vitest";
import {
  excessTraversalMessage,
  takeRefusedTraversals,
} from "../../test-support/component-mount/historyTraversalGuard.ts";

const orchestrator = () => window.top ?? window;

function nextPopstate() {
  return new Promise<void>((resolve) => {
    window.addEventListener(
      "popstate",
      () => {
        resolve();
      },
      { once: true },
    );
  });
}

test("a Back past the frame's own entries throws the guard's message and leaves the orchestrator page where it was", () => {
  const address = orchestrator().location.href;
  const entries = orchestrator().history.length;

  expect(() => {
    history.back();
  }).toThrow(excessTraversalMessage);
  expect(() => {
    history.go(-2);
  }).toThrow(excessTraversalMessage);
  expect(takeRefusedTraversals()).toHaveLength(2);

  expect(orchestrator().location.href).toBe(address);
  expect(orchestrator().history.length).toBe(entries);
});

test("Back and Forward within the frame's own entries still traverse", async () => {
  history.pushState({ step: 1 }, "", "?step=1");
  history.pushState({ step: 2 }, "", "?step=2");

  const back = nextPopstate();
  history.back();
  await back;
  expect(history.state).toEqual({ step: 1 });

  const forward = nextPopstate();
  history.forward();
  await forward;
  expect(history.state).toEqual({ step: 2 });

  const home = nextPopstate();
  history.go(-2);
  await home;
  expect(history.state).toBeNull();
  expect(takeRefusedTraversals()).toEqual([]);
});

test.fails(
  "a refused Back that app code swallowed still fails its own case",
  () => {
    try {
      history.back();
    } catch {
      // App code, such as a Back button handler, may drop the throw.
    }
  },
);
