// @ts-check
// The machine's full answer to a page's sessions read
// (`../../../dashboard/src/agentLaunch.ts` `MachineAnswer`): the kept launches as
// observed (`./launchObservationTestData.mjs`), the accepted attempts as the
// answering server observes them (`./launchAttemptObservationTestData.mjs`),
// and the starts the machine is establishing. Revision envelopes around it
// are `../../../dashboard/src/machineSessionsRevision.ts`.

import {
  ObservedLaunchBuilder,
  SessionStateBuilder,
} from "./launchObservationTestData.mjs";

/** @typedef {import("../../../dashboard/src/agentLaunch.ts").MachineAnswer} MachineAnswer */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchWithState} LaunchWithState */
/** @typedef {import("../../../dashboard/src/launchOutcome.ts").AttemptObservation} AttemptObservation */
/** @typedef {MachineAnswer["establishingHosts"][number]} EstablishingStart */
/** @typedef {MachineAnswer["creations"][number]} CreationView */
/** @typedef {MachineAnswer["definitions"][number]} OfferedDefinition */

// One answer. Unless stated it observes no session, answers no attempt,
// establishes nothing, offers no options, and cannot alert. Every host attaches, stops and lists
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
  /** @type {OfferedDefinition[]} */
  #definitions = [];

  /**
   * The kept launches as observed, in answer order.
   * @param {...LaunchWithState} records
   */
  observing(...records) {
    this.#records.push(...records.map((record) => structuredClone(record)));
    return this;
  }

  /**
   * Kept launches whose sessions the host retains for review, as a launch
   * marked Done is observed.
   * @param {...LaunchRecord} records
   */
  observingDone(...records) {
    return this.#observingIn(
      () => new SessionStateBuilder().retained("review"),
      records,
    );
  }

  /**
   * Kept launches whose sessions the host can no longer report.
   * @param {...LaunchRecord} records
   */
  observingUnavailable(...records) {
    return this.#observingIn(
      () => new SessionStateBuilder().unavailable(),
      records,
    );
  }

  /**
   * Kept launches whose sessions are loaded and working.
   * @param {...LaunchRecord} records
   */
  observingOpen(...records) {
    return this.#observingIn(
      () => new SessionStateBuilder().loaded("working"),
      records,
    );
  }

  /**
   * @param {() => SessionStateBuilder} state
   * @param {LaunchRecord[]} records
   */
  #observingIn(state, records) {
    return this.observing(
      ...records.map((record) =>
        new ObservedLaunchBuilder()
          .of(record)
          .withSessionState(state().please())
          .please(),
      ),
    );
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

  /**
   * The options a project's installed skill offers a workflow's launch in a
   * host, or why it offers none.
   * @param {...OfferedDefinition} definitions
   */
  offering(...definitions) {
    this.#definitions.push(
      ...definitions.map((definition) => structuredClone(definition)),
    );
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
      definitions: structuredClone(this.#definitions),
      establishingHosts: this.#establishing.map((start) => ({ ...start })),
      sessionPolicies: [],
      workspaces: [],
    };
  }
}
