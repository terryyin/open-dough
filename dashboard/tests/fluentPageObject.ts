// The base every fluent page object of the Side panel journeys shares. Each
// object belongs to one phase's page-object set (./sidePanelPages.ts), which
// holds the page and the phase's cue sheet (./support/cueSheet.ts); each
// method writes one named cue on that sheet and returns the page object the
// reader is then at, taken from the set rather than constructed. A
// page-object module therefore imports this base at run time and names the
// set only as a type.

import type { SidePanelPages } from "./sidePanelPages.ts";

export abstract class PageObject {
  // The phase's page objects, through which this one hands off.
  protected readonly pages: SidePanelPages;

  constructor(pages: SidePanelPages) {
    this.pages = pages;
  }

  protected get page() {
    return this.pages.page;
  }

  protected get cues() {
    return this.pages.cues;
  }

  // Writes the cue and leaves the reader at `next`.
  protected cue<Next>(name: string, run: () => Promise<void>, next: Next) {
    this.cues.cue(name, run);
    return next;
  }

  // Writes the cue and leaves the reader here.
  protected cueHere(name: string, run: () => Promise<void>) {
    return this.cue(name, run, this);
  }

  get sidePanel() {
    return this.pages.sidePanel;
  }
}
