// @ts-check
// The machine's full answer to a page's sessions read
// (`../../../dashboard/src/agentLaunch.ts` `MachineAnswer`): the kept launches as
// observed (`./launchObservationTestData.mjs`), the accepted attempts as the
// answering server observes them (`./launchAttemptObservationTestData.mjs`),
// and the starts the machine is establishing. Revision envelopes around it
// are `../../../dashboard/src/machineSessionsRevision.ts`.

/** @typedef {import("../../../dashboard/src/agentLaunch.ts").MachineAnswer} MachineAnswer */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchWithState} LaunchWithState */
/** @typedef {import("../../../dashboard/src/launchOutcome.ts").AttemptObservation} AttemptObservation */
/** @typedef {MachineAnswer["establishingHosts"][number]} EstablishingStart */
/** @typedef {MachineAnswer["creations"][number]} CreationView */

// One answer. Unless stated it observes no session, answers no attempt,
// establishes nothing, and cannot alert. Every host attaches, stops and lists
// its launched sessions; Claude Code also stops a session marked Done, and
// Cursor marks Done locally.
export class MachineAnswerBuilder {
  /** @type {LaunchWithState[]} */
  #records = [];
  /** @type {AttemptObservation[]} */
  #attempts = [];
  /** @type {EstablishingStart[]} */
  #establishing = [];
  /** @type {CreationView[]} */
  #creations = [];

  /**
   * The kept launches as observed, in answer order.
   * @param {...LaunchWithState} records
   */
  observing(...records) {
    this.#records.push(...records.map((record) => structuredClone(record)));
    return this;
  }

  /**
   * The accepted attempts as the answering server observes them.
   * @param {...AttemptObservation} attempts
   */
  answeringAttempts(...attempts) {
    this.#attempts.push(...attempts.map((attempt) => structuredClone(attempt)));
    return this;
  }

  /**
   * The machine is establishing this project's execution start, or its
   * refinement's preparation, in this host.
   * @param {EstablishingStart} start
   */
  establishing({ source, workflow, host }) {
    this.#establishing.push({ source, workflow, host });
    return this;
  }

  /**
   * Unresolved conversation creations, as the machine views them.
   * @param {...CreationView} creations
   */
  withCreations(...creations) {
    this.#creations.push(...creations.map((view) => structuredClone(view)));
    return this;
  }

  /** @returns {MachineAnswer} */
  please() {
    const establishedBy = (/** @type {string} */ workflow) => [
      ...new Set(
        this.#establishing
          .filter((start) => start.workflow === workflow)
          .map((start) => start.source),
      ),
    ];
    return {
      hostOperations: {
        claude: {
          attach: true,
          stop: true,
          doneStop: true,
          localDone: false,
          launchedSessions: true,
        },
        codex: {
          attach: true,
          stop: true,
          doneStop: false,
          localDone: false,
          launchedSessions: true,
        },
        cursor: {
          attach: true,
          stop: true,
          doneStop: false,
          localDone: true,
          launchedSessions: true,
        },
      },
      attempts: structuredClone(this.#attempts),
      attemptsReadable: true,
      records: structuredClone(this.#records),
      creations: structuredClone(this.#creations),
      alerts: { available: false, reason: "No alerts are arranged." },
      establishing: establishedBy("execution"),
      establishingPreparation: establishedBy("refinement"),
      keptStarts: [],
      starts: [],
      definitions: [],
      establishingHosts: this.#establishing.map((start) => ({ ...start })),
      sessionPolicies: [],
      workspaces: [],
    };
  }
}
