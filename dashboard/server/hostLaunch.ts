// Common launch facts and the request label; native instruction spelling stays
// with each host. Established facts come from the shared installed start.
import type {
  AgentLaunchRequest,
  RecordedLaunchRequest,
  LaunchResult,
  HostSession,
  SessionState,
} from "../src/agentLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { Established } from "./startLaunch.ts";

export type ListedSession = {
  readonly session: HostSession;
  readonly sessionState: Extract<SessionState, { readonly kind: "listed" }>;
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
