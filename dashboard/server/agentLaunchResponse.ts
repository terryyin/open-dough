// JSON responses from the local launch boundary, including refused requests.
// A full shared answer (`./machineSessionObservation.ts`) is negotiated: a
// caller accepting gzip under HTTP Semantics §12.5.3 receives it gzip-encoded,
// from bytes encoded at most once per revision and shared by every viewer
// (`SharedGzip`); any other caller, one sending no `Accept-Encoding` or
// refusing gzip with `q=0` among them, receives the same JSON unencoded.
// Either varies by `Accept-Encoding`. Every other answer, an unchanged one
// among them, is sent as JSON unencoded, and none is stored by the browser.
import type { IncomingMessage, ServerResponse } from "node:http";
import { promisify } from "node:util";
import { gzip } from "node:zlib";
import type {
  Acceptance,
  ChangedAnswer,
  LaunchWithState,
  ReconciledAnswer,
  VerifiedAnswer,
} from "../src/agentLaunch.ts";
import type { DeleteRecordAnswer } from "../src/deleteRecord.ts";
import type { RunningCursorSessions } from "../src/cursorRunnerSessions.ts";
import type { RecoverSessionAnswer } from "../src/sessionRecovery.ts";
import type { FinalReportRead } from "../src/finalReportContract.ts";
import type {
  MarkReviewedAnswer,
  ReviewedFileDiff,
  ReviewedFileText,
  StoryReview,
  ReviewRange,
} from "../src/storyReviewContract.ts";
import type { LaunchHostOptions } from "../src/launchHostOptions.ts";

import type { submitCompletion } from "./completionReporting.ts";

import type { LandingReceipt } from "../src/launchLanding.ts";

export type AgentLaunchAnswer =
  | { readonly status: number; readonly body: { readonly drained: true } }
  | { readonly status: number; readonly body: LandingReceipt }
  | {
      readonly status: number;
      readonly body: Awaited<ReturnType<typeof submitCompletion>>;
    }
  | { readonly status: number; readonly body: LaunchHostOptions }
  | { readonly status: number; readonly body: FinalReportRead }
  | { readonly status: number; readonly body: StoryReview }
  | { readonly status: number; readonly body: ReviewRange }
  | { readonly status: number; readonly body: ReviewedFileDiff }
  | { readonly status: number; readonly body: ReviewedFileText }
  | { readonly status: number; readonly body: MarkReviewedAnswer }
  | { readonly status: number; readonly body: RunningCursorSessions }
  | { readonly status: number; readonly body: Acceptance }
  | { readonly status: number; readonly body: ChangedAnswer }
  | { readonly status: number; readonly body: ReconciledAnswer }
  | { readonly status: number; readonly body: VerifiedAnswer }
  // An answer serialized once and shared (`./machineSessionObservation.ts`),
  // with its shared gzip encoding when it has one.
  | ({ readonly status: number } & SharedAnswer)
  | { readonly status: number; readonly body: { record: LaunchWithState } }
  | { readonly status: number; readonly body: DeleteRecordAnswer }
  | { readonly status: number; readonly body: RecoverSessionAnswer }
  | { readonly status: number; readonly body: { error: string } };

// A serialized answer, and, for a full one, its encoding shared by viewers.
export type SharedAnswer = {
  readonly serialized: string;
  readonly gzipped?: () => Promise<Buffer>;
};

const gzipped = promisify(gzip);

// The gzip encoding of one audience's answer, encoded asynchronously at most
// once per revision and shared by every viewer asking for that revision. It
// keeps only the latest revision's; a failed encoding is tried again by the
// next viewer.
export class SharedGzip {
  private latest:
    | { readonly revision: string; readonly encoded: Promise<Buffer> }
    | undefined;

  // The encoding of `serialized`, the answer under `revision`, on first need.
  of(revision: string, serialized: () => string): () => Promise<Buffer> {
    return () => {
      if (this.latest?.revision === revision) return this.latest.encoded;
      const latest = { revision, encoded: gzipped(serialized()) };
      this.latest = latest;
      latest.encoded.catch(() => {
        if (this.latest === latest) this.latest = undefined;
      });
      return latest.encoded;
    };
  }
}

// An HTTP Semantics §12.5.3 qvalue, or undefined when malformed.
function qvalue(parameters: readonly string[]): number | undefined {
  for (const parameter of parameters) {
    const [name, value] = parameter.split("=").map((part) => part.trim());
    if (name?.toLowerCase() !== "q") continue;
    return value !== undefined &&
      /^(?:0(?:\.[0-9]{0,3})?|1(?:\.0{0,3})?)$/.test(value)
      ? Number(value)
      : undefined;
  }
  return 1;
}

// Whether an `Accept-Encoding` field value accepts gzip: named, or `*` when it
// is not, with a nonzero weight. A request without the field is answered
// unencoded, as an unknown caller's.
function acceptsGzip(field: string | undefined): boolean {
  if (field === undefined) return false;
  let named: number | undefined;
  let any: number | undefined;
  for (const member of field.split(",")) {
    const [coding = "", ...parameters] = member.split(";");
    const name = coding.trim().toLowerCase();
    const weight = qvalue(parameters) ?? 0;
    if (name === "gzip" || name === "x-gzip") named ??= weight;
    else if (name === "*") any ??= weight;
  }
  return (named ?? any ?? 0) > 0;
}

async function encodedFor(
  req: IncomingMessage,
  answer: SharedAnswer,
): Promise<Buffer | undefined> {
  if (!acceptsGzip(req.headers["accept-encoding"])) return undefined;
  try {
    return await answer.gzipped?.();
  } catch {
    // The same JSON unencoded still answers the caller.
    return undefined;
  }
}

export async function respondToLaunch(
  req: IncomingMessage,
  res: ServerResponse,
  answer: AgentLaunchAnswer,
): Promise<void> {
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  };
  if (!("serialized" in answer)) {
    if (res.writableEnded || res.destroyed) return;
    res.writeHead(answer.status, headers);
    res.end(JSON.stringify(answer.body));
    return;
  }
  const negotiated = answer.gzipped !== undefined;
  const encoded = negotiated ? await encodedFor(req, answer) : undefined;
  if (res.writableEnded || res.destroyed) return;
  const sent = encoded ?? Buffer.from(answer.serialized);
  res.writeHead(answer.status, {
    ...headers,
    "Content-Length": String(sent.length),
    ...(negotiated && { Vary: "Accept-Encoding" }),
    ...(encoded !== undefined && { "Content-Encoding": "gzip" }),
  });
  res.end(sent);
}
