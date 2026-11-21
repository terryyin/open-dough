// Whether a part's words read whole: no word laid across lines, measured by
// asking the browser where each run of text is drawn.

import type { Locator } from "@playwright/test";

// Words between spaces laid on more than one line, in each of the part's
// descendants that `within` selects. This includes tokens such as a short
// commit or a duration.
export const wordsBrokenApart = (part: Locator, within: string) =>
  part.evaluate((element, within) => {
    const broken: string[] = [];
    for (const each of element.querySelectorAll(within)) {
      const walker = document.createTreeWalker(each, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const run of (node.textContent ?? "").matchAll(/\S+/gu)) {
          const range = document.createRange();
          range.setStart(node, run.index);
          range.setEnd(node, run.index + run[0].length);
          const tops = new Set(
            [...range.getClientRects()].map((rect) => Math.round(rect.top)),
          );
          if (tops.size > 1) broken.push(run[0]);
        }
      }
    }
    return broken;
  }, within);
