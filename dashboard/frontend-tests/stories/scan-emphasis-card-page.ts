// The parts of a mounted Board's story card that a reader scans: its title,
// compact progress, current session, Done disclosure and inspection group,
// with the colours and boxes the browser computes for them.

import { expect } from "vitest";

function get(root: ParentNode, selector: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error(`Expected ${selector}`);
  return element;
}

// The colour a page colour token resolves to, as computed styles report it.
function tokenColour(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

function openTerminalIn(session: HTMLElement) {
  const button = [...session.querySelectorAll("button")].find((each) =>
    /Open terminal/i.test(
      each.textContent + (each.getAttribute("aria-label") ?? ""),
    ),
  );
  if (button === undefined) throw new Error("Expected Open terminal");
  return button;
}

export function scanEmphasisCard(container: HTMLElement, title: string) {
  const card = get(container, `article[aria-label="${title}"]`);
  const doneDisclosure = get(card, "details.story-card-done");
  const openSession = get(card, ".story-card-sessions .session-entry");
  const parts = {
    heading: get(card, "h3"),
    meta: get(card, ".story-card-meta"),
    progress: get(card, ".story-card-meta .story-card-progress"),
    sliceBar: get(card, ".story-card-meta .slice-bar"),
    openSession,
    openTerminal: openTerminalIn(openSession),
    doneDisclosure,
    doneSummary: get(doneDisclosure, "summary"),
    inspectionGroup: get(card, ".story-card-inspection-group"),
    inspect: get(card, ".story-card-inspection-group .inspect-story"),
  };
  return {
    parts,
    // The count the slice bar is named for, such as "1 of 3 slices
    // recorded complete".
    sliceCount: () =>
      document.getElementById(
        parts.sliceBar.getAttribute("aria-labelledby") ?? "",
      )?.textContent,
    sliceStatuses: () =>
      [...parts.sliceBar.querySelectorAll("[data-slice-status]")].map(
        (segment) => segment.getAttribute("data-slice-status"),
      ),
    // Each part ends above where the next begins.
    expectStackedInOrder(inOrder: readonly Element[]) {
      const boxes = inOrder.map((part) => part.getBoundingClientRect());
      boxes.slice(1).forEach((next, index) => {
        expect(
          boxes[index]?.bottom,
          `part ${index + 1} ends before part ${index + 2} begins`,
        ).toBeLessThanOrEqual(next.top + 0.5);
      });
    },
    // The open session is washed in the accent and reads in the card's text;
    // Done and Inspect read in the quiet colour.
    expectEmphasis() {
      expect(getComputedStyle(openSession).backgroundColor).toBe(
        tokenColour("--accent-soft"),
      );
      expect(getComputedStyle(openSession).color).toBe(
        getComputedStyle(card).color,
      );
      expect(getComputedStyle(card).color).not.toBe(tokenColour("--quiet"));
      expect(getComputedStyle(parts.doneSummary).color).toBe(
        tokenColour("--quiet"),
      );
      expect(getComputedStyle(parts.inspect).color).toBe(
        tokenColour("--quiet"),
      );
    },
    expectFocusedInTurn(controls: readonly HTMLElement[]) {
      for (const control of controls) {
        control.focus();
        expect(document.activeElement).toBe(control);
      }
    },
    expectVisible(shown: readonly Element[]) {
      for (const each of shown) expect(each.checkVisibility()).toBe(true);
    },
  };
}
