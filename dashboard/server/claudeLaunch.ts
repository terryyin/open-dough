// Starting one Claude Code session for the local launch boundary
// (`./agentLaunches.ts`) and classifying the outcome: the instruction and name
// a session starts with, run through `claude --bg` (`./claudeCode.ts`),
// confirming the session it started through Claude Code's own session
// listing, and failure in fixed categories. Raw stderr may name local paths or
// echo configuration and is never forwarded, as with the `gh` boundary
// (`./ghRead.ts`). Only a model the developer chose is passed; no permission,
// effort, or session id is: the developer's own Claude Code settings apply,
// and `--bg` chooses its own session id, which it prints.

import type { ExecException } from "node:child_process";
import { stripVTControlCharacters } from "node:util";
import {
  launchSubject,
  launchModels,
  launchWorkflows,
  type AgentLaunchRequest,
  type RecordedLaunchRequest,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  claudeSessions,
  startClaudeInBackground,
  type ListedSession,
} from "./claudeCode.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { Established } from "./startLaunch.ts";

export type HostLaunch =
  | ({ readonly kind: "launched" } & ListedSession)
  | Exclude<LaunchResult, { readonly kind: "launched" }>;

const labelLimit = 40;
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// The local time, to the minute, as `30 Sep, 14:32`.
function launchTime(at: Date): string {
  const clock = [at.getHours(), at.getMinutes()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
  return `${String(at.getDate())} ${months[at.getMonth()] ?? ""}, ${clock}`;
}

// An ad hoc session's label: the developer's text with whitespace runs
// collapsed, cut at `labelLimit` characters with an ellipsis; the time the
// launch began when the text is blank or holds a control character.
function adHocLabel(instruction: string | undefined, began: Date): string {
  const text = (instruction ?? "").replace(/\s+/g, " ").trim();
  if (text === "" || /\p{Cc}/u.test(text)) {
    return launchTime(began);
  }
  const characters = Array.from(
    new Intl.Segmenter().segment(text),
    ({ segment }) => segment,
  );
  return characters.length > labelLimit
    ? `${characters.slice(0, labelLimit).join("")}…`
    : text;
}

// The request a launch keeps: an ad hoc one titled with its label, the one
// place the label is derived.
export function recordedRequest(
  request: AgentLaunchRequest,
  began: Date,
): RecordedLaunchRequest {
  return request.workflow === "ad-hoc"
    ? { ...request, title: adHocLabel(request.instruction, began) }
    : request;
}

// What a launch's start established, and how the instruction carries it.
export type EstablishedHandoff = {
  readonly established: Established;
  readonly formatted: string;
};

// A launch's established start with the workspace its session opens in.
export type EstablishedLaunch = {
  readonly handoff: EstablishedHandoff;
  readonly workspace: ProjectFolder;
};

// The workflow's skill on the work item's identity, then the established
// start when the launch has one, then the developer's own instruction, when
// there is one, each after a blank line; an ad hoc session has only the
// instruction as typed, or none.
function claudeInstruction(
  request: RecordedLaunchRequest,
  established: EstablishedHandoff | undefined,
): string | undefined {
  const own = request.instruction?.trim();
  if (request.workflow === "ad-hoc") {
    return own ? request.instruction : undefined;
  }
  const skill = `/${launchWorkflows[request.workflow].skill} ${request.identity}`;
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

const checkAgents = "Check `claude agents` for it before starting again.";

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
        "Claude Code (`claude`) was not found on this machine. Install it, then start again.",
    };
  }
  if (typeof error.code === "number") {
    return /\bWorkspace not trusted\b/.test(stderr)
      ? {
          kind: "failed",
          reason: "folder-not-trusted",
          explanation: `Claude Code does not trust ${folder.shown} yet. Run \`claude\` in that folder once and accept the trust prompt, then start again.`,
        }
      : {
          kind: "failed",
          reason: "refused",
          explanation: `Claude Code refused to start a session in ${folder.shown}${model === undefined ? "" : ` with model ${launchModels[model].name}`}. Run \`claude\` in that folder once to see why, then start again.`,
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
