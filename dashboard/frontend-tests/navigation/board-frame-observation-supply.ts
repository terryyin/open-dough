// Typed observation and machine replies for Board frame ConfiguredDashboard mounts.
import { onTestFinished } from "vitest";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { AcceptanceAnswer } from "../../src/agentLaunchClient.ts";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { MachineSessionsRead } from "../../src/machineSessionsRevision.ts";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import type {
  RevisionCheck,
  RevisionStreamHandlers,
  RevisionStreamSubscription,
} from "../../src/revisionCheckRead.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import {
  backlogMarkdownOf,
  emptyMachineAnswer,
  entriesOf,
  rosterProfileTexts,
} from "./board-frame-fixture-text.ts";

export {
  backlogMarkdownOf,
  emptyMachineAnswer,
  forceRevisionStreamDelivery,
} from "./board-frame-fixture-text.ts";

type SnapshotAnswer =
  | PublishedWork
  | Promise<PublishedWork>
  | Error
  | ((signal: AbortSignal) => Promise<PublishedWork>);

export function holdPublishedSnapshot(work: PublishedWork) {
  let answer: (work: PublishedWork) => void = () => {};
  const snapshot = new Promise<PublishedWork>((resolve) => {
    answer = resolve;
  });
  const release = () => {
    answer(work);
  };
  onTestFinished(release);
  return { snapshot, release };
}

export type BoardFrameObservation = {
  readonly observation: PublishedObservationReadSource;
  readonly machine: MachineReadSource;
  readonly snapshotAsks: {
    readonly sourceId: string;
    readonly revision: string | undefined;
  }[];
  readonly detailPaths: string[];
  readonly queueSnapshot: (work: SnapshotAnswer) => void;
  readonly revisionChanged: (revision: string) => void;
  readonly revisionCheckFailed: (error: Error) => void;
  readonly subscriptionCount: () => number;
};

export function boardFrameObservationSupplying(
  snapshots: readonly PublishedWork[],
  {
    initialSnapshot,
    checkRevision,
    machineAnswer = emptyMachineAnswer(),
    accept,
  }: {
    initialSnapshot?: Error | Promise<PublishedWork>;
    checkRevision?: PublishedObservationReadSource["checkRevision"];
    machineAnswer?: MachineAnswer & { readonly revision?: string };
    accept?: (
      ...args: Parameters<MachineReadSource["requestAcceptance"]>
    ) => Promise<AcceptanceAnswer>;
  } = {},
): BoardFrameObservation {
  const bySource = new Map(snapshots.map((work) => [work.source.id, work]));
  const queued: SnapshotAnswer[] = [];
  if (initialSnapshot !== undefined) queued.push(initialSnapshot);
  const snapshotAsks: BoardFrameObservation["snapshotAsks"] = [];
  const detailPaths: string[] = [];
  const streamHandlers: RevisionStreamHandlers[] = [];
  const unread = pageReadsSupplying({}).observation;

  const resolveSnapshot = async (
    sourceId: string,
    signal: AbortSignal,
    knownRevision: string | undefined,
  ): Promise<{ revision: string; backlog: string }> => {
    snapshotAsks.push({ sourceId, revision: knownRevision });
    if (queued.length > 0) {
      const next = queued.shift();
      if (next === undefined) {
        throw new Error(`Queued snapshot for ${sourceId} vanished.`);
      }
      if (next instanceof Error) throw next;
      const work = await (typeof next === "function" ? next(signal) : next);
      bySource.set(work.source.id, work);
      return {
        revision: work.revision,
        backlog: backlogMarkdownOf(work),
      };
    }
    const held = bySource.get(sourceId);
    if (held === undefined) {
      throw new Error(`No published work fixture for ${sourceId}.`);
    }
    if (knownRevision !== undefined && knownRevision !== held.revision) {
      throw new Error(
        `No queued snapshot for ${sourceId} at ${knownRevision}.`,
      );
    }
    return { revision: held.revision, backlog: backlogMarkdownOf(held) };
  };

  const observation: PublishedObservationReadSource = {
    ...unread,
    readSnapshot: (...[source, signal, knownRevision]) =>
      resolveSnapshot(source.id, signal, knownRevision),
    readDetailFile: (...[, path]) => {
      detailPaths.push(path);
      for (const work of bySource.values()) {
        const entry = entriesOf(work).find((each) => {
          if (each.canonical.kind !== "snapshot") return false;
          return (
            each.canonical.recorded === path ||
            each.canonical.recorded.endsWith(path) ||
            path.endsWith(each.canonical.recorded.replace(/^\.\//, ""))
          );
        });
        if (entry?.dependencies?.status === "unavailable") {
          return Promise.reject(new ReadProblem(entry.dependencies.problem));
        }
      }
      return Promise.resolve(`# Detail for ${path}\n`);
    },
    readProfiles: (...[source]) => {
      const work = bySource.get(source.id);
      if (work?.roster?.status === "read") {
        return Promise.resolve({
          profiles: rosterProfileTexts(work.roster),
          settings: undefined,
        });
      }
      return Promise.resolve({ profiles: [], settings: undefined });
    },
    readProfileAddition: () =>
      Promise.resolve({
        commit: "c".repeat(40),
        committerName: "Board",
        committedAt: "2026-01-01T00:00:00.000Z",
        login: "board",
      }),
    readDoneCatalog: (...[source]) => {
      const work = bySource.get(source.id);
      const done = work?.done;
      if (done?.status === "catalogued") {
        return Promise.resolve({
          status: "catalogued" as const,
          records: [...done.records],
          unreadable: [...done.unreadable],
        });
      }
      return Promise.resolve({
        status: "catalogued" as const,
        records: [],
        unreadable: [],
      });
    },
    listPublishedSessions: (...[source]) => {
      const work = bySource.get(source.id);
      const sessions = work?.publishedSessions;
      if (sessions?.status === "listed") {
        return Promise.resolve(sessions.sessions);
      }
      return Promise.resolve([]);
    },
    checkRevision:
      checkRevision ??
      (() =>
        Promise.resolve({
          changed: false,
          heads: new Map(),
        } satisfies RevisionCheck)),
    subscribeRevision: (...[, , , handlers]) => {
      streamHandlers.push(handlers);
      return {
        close: () => {
          const at = streamHandlers.indexOf(handlers);
          if (at >= 0) streamHandlers.splice(at, 1);
        },
      } satisfies RevisionStreamSubscription;
    },
  };

  const fullAnswer = (): MachineSessionsRead => ({
    ...machineAnswer,
    revision: machineAnswer.revision ?? "m".repeat(40),
  });

  const machine: MachineReadSource = {
    readSessionsSince: (...[held, , options]) => {
      if (
        options?.fresh !== true &&
        held !== undefined &&
        held === (machineAnswer.revision ?? "m".repeat(40))
      ) {
        return Promise.resolve({
          unchanged: true,
          revision: held,
        });
      }
      return Promise.resolve(fullAnswer());
    },
    requestAcceptance:
      accept ??
      (() =>
        Promise.resolve({
          kind: "failed",
          explanation: "This Board frame supplies no acceptance.",
        })),
  };

  return {
    observation,
    machine,
    snapshotAsks,
    detailPaths,
    queueSnapshot: (work) => {
      queued.push(work);
    },
    revisionChanged: (revision) => {
      const handlers = streamHandlers.at(-1);
      if (handlers === undefined) {
        throw new Error("The Board hasn't bound its revision subscription.");
      }
      handlers.onCheck({ changed: true, revision });
    },
    revisionCheckFailed: (error) => {
      const handlers = streamHandlers.at(-1);
      if (handlers === undefined) {
        throw new Error("The Board hasn't bound its revision subscription.");
      }
      handlers.onFailure(error);
    },
    subscriptionCount: () => streamHandlers.length,
  };
}
