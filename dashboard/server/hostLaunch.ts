// Common launch facts and the request label; native instruction spelling stays
// with each host. Established facts come from the shared installed start.
import {
  withoutConfirmation,
  type AgentLaunchRequest,
  type EstablishedSession,
  type RecordedLaunchRequest,
  type LaunchResult,
  type HostSession,
  type SessionPolicy,
  type SessionState,
} from "../src/agentLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { Established } from "./startLaunch.ts";

// A host's bounded diagnostic safe to retain beside local operation intent.
export class HostOperationFailure extends Error {
  constructor(message: string) {
    super(
      message
        .replace(/\p{Cc}/gu, " ")
        .trim()
        .slice(0, 500),
    );
  }
}

// A terminal attachment that failed to open, or ended before its first screen.
export class TerminalAttachmentUnopened extends HostOperationFailure {
  constructor() {
    super("The terminal attachment could not be opened.");
  }
}

// An observation of one recorded host-qualified native target.
export type SessionObservation = {
  readonly session: HostSession;
  readonly sessionState: SessionState;
};

export type HostLaunch =
  | {
      readonly kind: "launched";
      readonly session: HostSession;
      readonly sessionState: SessionState;
    }
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

// The text an ad hoc session is labeled with: the developer's, with
// whitespace runs collapsed; none when it is blank or holds a control
// character, so the label is a time.
export function adHocLabelText(
  instruction: string | undefined,
): string | undefined {
  const text = (instruction ?? "").replace(/\s+/g, " ").trim();
  return text === "" || /\p{Cc}/u.test(text) ? undefined : text;
}

// An ad hoc session's label: its text, cut at `labelLimit` characters with
// an ellipsis; the time the launch began when it has none.
function adHocLabel(instruction: string | undefined, began: Date): string {
  const text = adHocLabelText(instruction);
  if (text === undefined) return launchTime(began);
  const characters = Array.from(
    new Intl.Segmenter().segment(text),
    ({ segment }) => segment,
  );
  return characters.length > labelLimit
    ? `${characters.slice(0, labelLimit).join("")}…`
    : text;
}

// The request a launch keeps, without the transient confirmation of existing
// changes: an ad hoc one titled with its label, the one place the label is
// derived.
export function recordedRequest(
  request: AgentLaunchRequest,
  began: Date,
): RecordedLaunchRequest {
  const recorded = withoutConfirmation(request);
  return recorded.workflow === "ad-hoc"
    ? { ...recorded, title: adHocLabel(recorded.instruction, began) }
    : recorded;
}

// A story's recorded request with the policy its start ran with, a kept
// start's own whatever this launch asked, kept only when it is not the
// default.
export function withStartPolicy(
  request: RecordedLaunchRequest,
  policy: SessionPolicy,
): RecordedLaunchRequest {
  if (request.workflow === "ad-hoc") return request;
  const recorded = { ...request };
  delete recorded.policy;
  return policy.tracking === "standard" ? recorded : { ...recorded, policy };
}

// What an unattached launch's start established, under the key its launch
// record keeps it by.
export type UnattachedEstablished = {
  readonly establishedSession: EstablishedSession;
};

// What a launch's start established, a story's or an unattached session's,
// and how the first input carries it.
export type EstablishedHandoff<Facts = Established | UnattachedEstablished> = {
  readonly established: Facts;
  readonly formatted: string;
};

// A launch's established start with the workspace its session opens in.
export type EstablishedLaunch<Facts = Established | UnattachedEstablished> = {
  readonly handoff: EstablishedHandoff<Facts>;
  readonly workspace: ProjectFolder;
};
