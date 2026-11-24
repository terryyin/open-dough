// Open Sessions row state edges and hidden labels from typed observations:
// border style, thickness and colour per state, plus the assistive label.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { SessionState } from "../../src/launchRecord.ts";
import { mountOpenSessions, observe } from "./sessions-sidebar-open-mount.ts";
import {
  entries,
  entryOf,
  hiddenStateLabelOf,
  openControlOf,
  present,
} from "./sessions-sidebar-page.ts";

// Independent edge expectations: style, thickness and colour each distinguish
// the state; rgb matches the page's light --problem/--ready/--accent/--edge.
const edges = {
  "needs-input": { style: "solid", width: "5px", color: "rgb(155, 28, 28)" },
  ready: { style: "solid", width: "5px", color: "rgb(27, 110, 60)" },
  halted: { style: "dashed", width: "3px", color: "rgb(155, 28, 28)" },
  working: { style: "solid", width: "2px", color: "rgb(27, 95, 168)" },
  unsettled: { style: "dotted", width: "3px", color: "rgb(111, 111, 104)" },
} as const;

type Tone = keyof typeof edges;

const states = [
  ["Working", "working", makeMe.aSessionState.loaded("working").please()],
  [
    "Needs input",
    "needs-input",
    makeMe.aSessionState.loaded("waiting").please(),
  ],
  ["Ready for review", "ready", makeMe.aSessionState.loaded("review").please()],
  ["Session failed", "halted", makeMe.aSessionState.loaded("failed").please()],
  [
    "Session stopped",
    "halted",
    makeMe.aSessionState.loaded("interrupted").please(),
  ],
  [
    "Session unavailable",
    "unsettled",
    makeMe.aSessionState.unavailable().please(),
  ],
  [
    "State not recognized: Claude Code lists it as napping",
    "unsettled",
    makeMe.aSessionState
      .loaded("unknown")
      .describedAs("Claude Code lists it as napping")
      .please(),
  ],
] as const satisfies readonly (readonly [string, Tone, SessionState])[];

function edgeOf(entry: HTMLElement) {
  const style = getComputedStyle(entry);
  return {
    style: style.borderLeftStyle,
    width: style.borderLeftWidth,
    color: style.borderLeftColor,
  };
}

test("each state has its own border style, thickness, and colour, and its hidden label", async () => {
  const titles: string[] = [];
  for (let index = 0; index < states.length; index += 1) {
    titles.push(`Edge story ${String(index)}`);
  }
  const observed = observe(
    states.map(([, , state], index) => {
      const title = titles[index] ?? "?";
      return {
        record: makeMe.aLaunchRecord
          .executing({
            identity: `SEED-901#edge-${String(index)}`,
            title,
            source: "doughnut",
          })
          .inClaudeSession({ sessionId: `edge-${String(index)}` })
          .please(),
        state,
      };
    }),
  );
  await mountOpenSessions(observed);

  await expect.poll(() => entries().length).toBe(states.length);

  for (const [index, [words, tone]] of states.entries()) {
    const title = titles[index] ?? "?";
    const entry = present(entryOf(title), `row ${title}`);
    const expected = edges[tone];
    const tooltip = openControlOf(entry).getAttribute("title") ?? "";
    expect(tooltip.split("\n")).toContain(words);
    expect(edgeOf(entry)).toEqual(expected);
    const hidden = hiddenStateLabelOf(entry);
    expect(hidden.textContent).toBe(words.split(":")[0] ?? "");
    const box = hidden.getBoundingClientRect();
    expect(box.width).toBeLessThanOrEqual(1);
    expect(box.height).toBeLessThanOrEqual(1);
  }

  const widthOf = (title: string) =>
    parseFloat(edgeOf(present(entryOf(title), `row ${title}`)).width);
  const thick = widthOf(titles[1] ?? "?");
  expect(widthOf(titles[2] ?? "?")).toBe(thick);
  expect(thick).toBeGreaterThan(widthOf(titles[0] ?? "?"));
});
