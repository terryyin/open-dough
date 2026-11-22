// @ts-check
// A Done story's collected CI wall time through its published landing, as
// the Done comparison's history read answers it
// (dashboard/src/ciDoneWallTimeHistory.ts). Node-free.

/** @typedef {import("../../../dashboard/src/ciDoneWallTimeHistory.ts").DoneWallTimeHistory} DoneWallTimeHistory */
/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").MeasuredEntry} MeasuredEntry */
/** @typedef {NonNullable<DoneWallTimeHistory["reference"]["selected"]>} SelectedTiming */

const day = 24 * 60 * 60 * 1000;
// The selected landing's build starts on Nov 5; each prior build a day earlier.
const selectedStart = Date.parse("2026-11-05T10:00:00.000Z");
const isoAt = (/** @type {number} */ ms) => new Date(ms).toISOString();
const wholeSeconds = (/** @type {number} */ ms) =>
  `${ms < 0 ? "-" : "+"}${String(Math.abs(ms) / 1000)} s`;

// A Done story's collected CI wall time through its published landing:
// whether the history is retained there, the prior builds before it, and
// how the landing itself was measured. Five priors of 1 min 43 s and an
// uncollected landing unless a step says otherwise.
export class DoneWallTimeHistoryBuilder {
  /** @type {DoneWallTimeHistory["availability"]} */
  #availability = "uncollected";
  /** @type {readonly number[]} */
  #priors = [103000, 103000, 103000, 103000, 103000];
  /** @type {((endpoint: string) => { selected: SelectedTiming; entry: MeasuredEntry; ms?: number }) | undefined} */
  #selected = undefined;

  // The landing's history is not retained: none collected, collected only
  // after it, or the landing itself not collected.
  noCollectedHistory() {
    this.#availability = "empty";
    this.#priors = [];
    return this;
  }
  outsideRetention() {
    this.#availability = "outside-retention";
    this.#priors = [];
    return this;
  }

  /** @param {readonly number[]} durations each prior build's wall time, oldest first */
  priors(durations) {
    this.#priors = durations;
    return this;
  }

  /** @param {number} ms the landing's own build's wall time */
  measured(ms) {
    return this.#measuredBy(ms, "exact");
  }

  // Another trunk build measured the landing: a later build, or a reused
  // equivalent first-parent build.
  /**
   * @param {"later" | "equivalent"} provenance
   * @param {string} revision the stand-in build's revision
   * @param {number} ms its wall time
   */
  standIn(provenance, revision, ms) {
    return this.#measuredBy(ms, provenance, revision);
  }

  // The landing's build is queued or running.
  pending() {
    return this.#unmeasured(
      { reason: "Pending · CI queued or running" },
      (endpoint) => ({
        kind: "gap",
        reason: "pending",
        waitsFor: "build",
        revision: endpoint,
        receivedAt: isoAt(selectedStart),
      }),
    );
  }

  failed() {
    return this.#unmeasured({ failed: true }, (endpoint) => ({
      kind: "gap",
      reason: "failed",
      revision: endpoint,
      receivedAt: isoAt(selectedStart),
    }));
  }

  // The landing's build passed, but its validated proof summary was not kept.
  proofNotRetained() {
    return this.#unmeasured(
      { reason: "Validated CI proof summary is not retained" },
      (endpoint) => ({
        kind: "gap",
        reason: "expired",
        revision: endpoint,
        receivedAt: isoAt(selectedStart),
      }),
    );
  }

  /**
   * @param {Partial<SelectedTiming>} timing
   * @param {(endpoint: string) => MeasuredEntry} entry
   */
  #unmeasured(timing, entry) {
    this.#availability = "retained";
    this.#selected = (endpoint) => ({
      selected: {
        key: `landing/${endpoint}`,
        date: isoAt(selectedStart),
        ...timing,
      },
      entry: entry(endpoint),
    });
    return this;
  }

  /**
   * @param {number} ms
   * @param {"exact" | "later" | "equivalent"} provenance
   * @param {string} [revision]
   */
  #measuredBy(ms, provenance, revision) {
    this.#availability = "retained";
    this.#selected = (endpoint) => {
      const build = revision ?? endpoint;
      return {
        selected: {
          key: `revision/${build}`,
          date: isoAt(selectedStart),
          ms,
        },
        entry: {
          kind: "point",
          revision: build,
          startedAt: isoAt(selectedStart),
          completedAt: isoAt(selectedStart + ms),
          timeMs: ms,
          landings: [
            {
              revision: endpoint,
              receivedAt: isoAt(selectedStart),
              provenance,
            },
          ],
        },
        ms,
      };
    };
    return this;
  }

  /** @param {string} endpoint the published Done landing's revision */
  through(endpoint) {
    const priors = this.#priors;
    /** @type {MeasuredEntry[]} */
    const entries = priors.map((ms, index) => {
      const start = selectedStart - (priors.length - index) * day;
      const revision = String(index + 1).repeat(40);
      return {
        kind: "point",
        revision,
        startedAt: isoAt(start),
        completedAt: isoAt(start + ms),
        timeMs: ms,
        landings: [{ revision, receivedAt: isoAt(start), provenance: "exact" }],
      };
    });
    const averageMs =
      priors.length >= 5
        ? priors.reduce((sum, ms) => sum + ms, 0) / priors.length
        : undefined;
    const selected = this.#selected?.(endpoint);
    if (selected !== undefined) entries.push(selected.entry);
    const changeMs =
      selected?.ms === undefined || averageMs === undefined
        ? undefined
        : selected.ms - averageMs;
    /** @type {DoneWallTimeHistory} */
    const history = {
      selectedRevision: endpoint,
      availability: this.#availability,
      entries,
      reference: {
        endpoint,
        sampleCount: priors.length,
        ...(selected === undefined ? {} : { selected: selected.selected }),
        ...(averageMs === undefined ? {} : { averageMs }),
        ...(changeMs === undefined || averageMs === undefined
          ? {}
          : {
              difference: {
                text: wholeSeconds(changeMs),
                changeMs,
                ...(averageMs === 0 ? {} : { relative: changeMs / averageMs }),
              },
            }),
      },
    };
    return { please: () => history };
  }
}
