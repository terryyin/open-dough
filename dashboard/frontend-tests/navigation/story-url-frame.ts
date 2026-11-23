import { expect, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import {
  mountBoardFrame,
  type BoardFrameMachine,
} from "./board-frame-mount.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";

export const sharedIdentity = "SEED-777#shared-story";
export const doughnutStory = story(
  "Doughnut's telling of the shared story",
  777,
  {
    identity: sharedIdentity,
  },
);
export const openDoughStory = story(
  "Open Dough's telling of the shared story",
  777,
  {
    identity: sharedIdentity,
  },
);
export const openDough = boardWork([openDoughStory]);
export const doughnut = boardWork([...longBacklog, doughnutStory], {
  id: "doughnut",
  label: "Doughnut",
});
export const wide = { width: 1440, height: 900 };

export const destination = page.getByRole("region", {
  name: "Story destination",
});
export const projectChoice = (label: string) =>
  page.getByRole("radio", { name: label, exact: true });
export const storyInAddress = () =>
  new URL(location.href).searchParams.get("story");

export function revealsOnPage() {
  const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
  onTestFinished(() => {
    scroll.mockRestore();
  });
  return () =>
    scroll.mock.calls.map(([options], index) => {
      const target = scroll.mock.contexts[index];
      return {
        title:
          target instanceof Element
            ? target.getAttribute("aria-label")
            : undefined,
        behavior: typeof options === "object" ? options.behavior : undefined,
      };
    });
}

export function coldStoryUrl(project: string, identity: string) {
  const original = location.href;
  const state: unknown = history.state;
  const url = new URL(original);
  url.searchParams.set("project", project);
  url.searchParams.set("story", identity);
  history.replaceState(state, "", url);
  onTestFinished(() => {
    history.replaceState(state, "", original);
  });
}

export async function mountStoryUrl(
  viewport = wide,
  options: Parameters<typeof mountBoardFrame>[4] = { otherWork: [doughnut] },
  work = openDough,
  machine: BoardFrameMachine = {},
) {
  const accept = vi
    .fn<NonNullable<BoardFrameMachine["accept"]>>()
    .mockRejectedValue(
      new Error("A story destination does not request an agent."),
    );
  const attach = vi.fn(() => {
    throw new Error("A story destination does not attach to a terminal.");
  });
  const frame = await mountBoardFrame(
    work,
    viewport,
    "stories",
    { ...machine, accept },
    {
      ...options,
      sessions: { ...pageReadsSupplying({}).sessions, openTerminal: attach },
    },
  );
  return {
    ...frame,
    expectNoHostAction() {
      expect(accept).not.toHaveBeenCalled();
      expect(attach).not.toHaveBeenCalled();
    },
  };
}
