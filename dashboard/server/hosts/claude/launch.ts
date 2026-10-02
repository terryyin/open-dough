// Starting one Claude Code session for the local launch boundary
// (`../../agentLaunches.ts`) and classifying the outcome: the instruction and name
// a session starts with, run through `claude --bg` (`./runtime.ts`),
// confirming the session it started through Claude Code's own session
// listing, and failure in fixed categories. Raw stderr may name local paths or
// echo configuration and is never forwarded, as with the `gh` boundary
// (`./ghRead.ts`). Only a model the developer chose is passed; no permission,
// effort, or session id is: the developer's own Claude Code settings apply,
// and `--bg` chooses its own session id, which it prints.

import type { ExecException } from "node:child_process";
import { stripVTControlCharacters } from "node:util";
import {
  launchArguments,
  launchSubject,
  launchWorkflows,
  type RecordedLaunchRequest,
} from "../../../src/agentLaunch.ts";
import {
  hostDescriptions,
  launchModelName,
} from "../../../src/hostDescription.ts";
import type { PublishedSource } from "../../../src/publishedSource.ts";
import { claudeSessions, startClaudeInBackground } from "./runtime.ts";
import type { ProjectFolder } from "../../projectFolders.ts";
import type {
  EstablishedHandoff,
  EstablishedLaunch,
  HostLaunch,
} from "../../hostLaunch.ts";

// The workflow's skill on the work item's identity, its policy's flags and
// the options selected (`launchArguments`),
// then the established start when the launch has one, then the developer's
// own instruction, when there is one, each after a blank line; an ad hoc
// session has only the instruction as typed, or none.
function claudeInstruction(
  request: RecordedLaunchRequest,
  established: EstablishedHandoff | undefined,
): string | undefined {
  const own = request.instruction?.trim();
  if (request.workflow === "ad-hoc") {
    return own ? request.instruction : undefined;
  }
  const skill = [
    `/${launchWorkflows[request.workflow].skill}`,
    ...launchArguments(request),
  ].join(" ");
  return [skill, established?.formatted, own]
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}

// `<project> · <kind> · <title>`, as `claude agents` lists it.
function claudeSessionName(
  source: PublishedSource,
  request: RecordedLaunchRequest,
): string {
  const { name, title } = launchSubject(request);
  return `${source.label} · ${name} · ${title}`;
}

// `claude --bg` reports its session as `backgrounded · <id> · <name>`, the id
// colored for a terminal.
const backgroundedLine = /^\s*backgrounded\s+·\s+([A-Za-z0-9-]{1,64})\s+·/m;

function printedShortId(stdout: string): string | undefined {
  return backgroundedLine.exec(stripVTControlCharacters(stdout))?.[1];
}

const checkAgents = hostDescriptions.claude.uncertaintyHint;

function timedOut(): HostLaunch {
  return {
    kind: "uncertain",
    reason: "timed-out",
    explanation: `Claude Code did not answer in time, so the session may or may not have started. ${checkAgents}`,
  };
}

function unconfirmed(): HostLaunch {
  return {
    kind: "uncertain",
    reason: "unconfirmed",
    explanation: `Claude Code reported no session this dashboard could confirm. ${checkAgents}`,
  };
}

// The folder was checked before `claude` ran, so a missing executable is the
// only `ENOENT`. A refusal names the model asked for, if any: what makes
// Claude Code refuse is not read from its stderr.
function failedLaunch(
  error: ExecException,
  stderr: string,
  folder: ProjectFolder,
  model: RecordedLaunchRequest["model"],
): HostLaunch {
  if (error.code === "ENOENT") {
    return {
      kind: "failed",
      reason: "not-installed",
      explanation:
        "Claude Code (`claude`) was not found on this machine. Install it to start a session.",
    };
  }
  if (typeof error.code === "number") {
    return /\bWorkspace not trusted\b/.test(stderr)
      ? {
          kind: "failed",
          reason: "folder-not-trusted",
          explanation: `Claude Code does not trust ${folder.shown} yet. Run \`claude\` in that folder once and accept the trust prompt.`,
        }
      : {
          kind: "failed",
          reason: "refused",
          explanation: `Claude Code refused to start a session in ${folder.shown}${model === undefined ? "" : ` with model ${launchModelName("claude", model)}`}. Run \`claude\` in that folder once to see why.`,
        };
  }
  return {
    kind: "failed",
    reason: "unavailable",
    explanation: "Claude Code could not be run. Nothing was launched.",
  };
}

// Read afresh after each `claude` run: the launch wait may expire while either
// the launch or its confirmation is running.
function expired(signal: AbortSignal): boolean {
  return signal.aborted;
}

// Starts one background session and confirms it in Claude Code's own listing.
// It starts in the project's folder, or in the established start's workspace
// when the launch has one. An abort (the launch wait expiring) leaves it
// uncertain whether a session started.
export async function launchClaude(
  source: PublishedSource,
  request: RecordedLaunchRequest,
  folder: ProjectFolder,
  signal: AbortSignal,
  established?: EstablishedLaunch,
): Promise<HostLaunch> {
  const startedIn = established?.workspace ?? folder;
  const launch = await startClaudeInBackground(
    claudeSessionName(source, request),
    {
      instruction: claudeInstruction(request, established?.handoff),
      model: request.model,
    },
    startedIn,
    signal,
  );
  if (expired(signal)) {
    return timedOut();
  }
  if (launch.error) {
    return failedLaunch(launch.error, launch.stderr, startedIn, request.model);
  }
  const shortId = printedShortId(launch.stdout);
  if (shortId === undefined) {
    return unconfirmed();
  }
  const listed = await claudeSessions(folder, signal);
  if (expired(signal)) {
    return timedOut();
  }
  const confirmed = listed?.find((entry) => entry.session.shortId === shortId);
  return confirmed === undefined
    ? unconfirmed()
    : { kind: "launched", ...confirmed };
}
