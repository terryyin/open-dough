// Codex launches independently delegate untouched settings. Thread creation supplies
// identity, first-input acceptance supplies confirmation, and neither supplies
// a current session/story state. The common durable writer is always awaited.
import { shellCommand } from "../../../src/sessionCapabilities.ts";
import { z } from "zod";
import { launchSubject } from "../../../src/agentLaunch.ts";
import type { CodexSession, FirstInput } from "../../../src/launchRecord.ts";
import type { LaunchHost } from "../../launchHosts.ts";
import type { HostLaunch } from "../../hostLaunch.ts";
import { codexInput, confirmedFirstInput } from "./input.ts";
import { connection, retire, observe } from "./conversation.ts";
import { CodexRpc, daemonEndpoint, NativeRefusal } from "./rpc.ts";
import { codexOptions } from "./options.ts";
import { materializeBlank } from "./blank.ts";

const threadSchema = z.object({
  thread: z.object({ id: z.string().min(1) }),
  model: z.unknown().optional(),
});
const turnSchema = z.object({ turn: z.object({ id: z.string().min(1) }) });
export const launchCodex: LaunchHost["launch"] = async (
  source,
  request,
  folder,
  signal,
  established,
  record,
): Promise<HostLaunch> => {
  let rpc: CodexRpc | undefined;
  let session: CodexSession | undefined;
  let evidence: FirstInput = { state: "awaiting" };
  let submitted = false;
  let persisted = false;
  try {
    if (record === undefined)
      throw new Error("Durable launch recording is required.");
    const workspace = established?.workspace.path ?? folder.path;
    if (request.model !== undefined) {
      let options;
      try {
        options = await codexOptions(signal);
      } catch {
        throw new NativeRefusal(
          "The requested model could not be verified. Retry, or use the Codex setting.",
        );
      }
      if (!options.models.some((item) => item.model === request.model))
        throw new NativeRefusal(
          "The selected Codex model is no longer available. Choose another model or use the Codex setting.",
        );
    }
    const endpoint = await daemonEndpoint(signal);
    await record.creating(workspace, endpoint);
    rpc = connection(endpoint, signal);
    await rpc.initialize();
    const native = threadSchema.parse(
      await rpc.request("thread/start", {
        cwd: workspace,
        ...(request.model === undefined ? {} : { model: request.model }),
      }),
    );
    rpc.watchThread(native.thread.id);
    session = {
      host: "codex",
      sessionId: native.thread.id,
      name: `${source.label} · ${launchSubject(request).name} · ${request.title}`,
      continuation: {
        workspace,
        endpoint,
        args: [
          "codex",
          "resume",
          "--remote",
          endpoint,
          "--cd",
          workspace,
          native.thread.id,
        ],
      },
    };
    const input = codexInput(request, workspace, established);
    const blank = request.workflow === "ad-hoc" && !request.instruction?.trim();
    const modelMatches =
      request.model === undefined || native.model === request.model;
    // The request keeps the intended text, but unverified settings must never
    // produce saved input that the existing continuation path can submit.
    evidence = !modelMatches
      ? {
          state: "awaiting",
          explanation:
            "Codex did not confirm the requested model. No first input was submitted; the conversation was kept.",
        }
      : blank
        ? { state: "awaiting", intent: "blank" }
        : { ...evidence, instruction: input[0]?.text };
    await record.session(session, evidence);
    persisted = true;
    if (!modelMatches) throw new Error(evidence.explanation);
    if (blank) {
      await materializeBlank(rpc, native.thread.id, workspace);
      evidence = { state: "not-requested", intent: "blank" };
      await record.session(session, evidence);
      retire(rpc);
      return { kind: "launched", session, sessionState: { kind: "unknown" } };
    }
    evidence = {
      ...evidence,
      state: "uncertain",
      explanation:
        "First-input acceptance has not been acknowledged. Continue this conversation before starting again.",
    };
    await record.session(session, evidence);
    submitted = true;
    const accepted = turnSchema.parse(
      await rpc.request("turn/start", { threadId: native.thread.id, input }),
    );
    evidence = confirmedFirstInput(evidence, accepted.turn.id);
    await record.session(session, evidence);
    observe(rpc, session, evidence, record);
    return { kind: "launched", session, sessionState: { kind: "unknown" } };
  } catch (error) {
    retire(rpc);
    if (session !== undefined) {
      if (submitted && error instanceof NativeRefusal) {
        evidence = {
          ...evidence,
          state: "awaiting",
          explanation:
            "Codex explicitly refused the first input. The existing conversation was kept.",
        };
        await record?.session(session, evidence).catch(() => {});
      }
      return {
        kind: "uncertain",
        reason: signal.aborted ? "timed-out" : "unconfirmed",
        explanation: `Codex conversation ${session.sessionId} ${persisted ? "is kept for recovery" : "could not be saved in the dashboard; retain its continuation for recovery"}. ${evidence.explanation ?? (submitted ? "Its first input is not confirmed; do not resend it blindly." : "No first input was submitted.")} Continue with \`${shellCommand(session.continuation?.args ?? [])}\`.`,
      };
    }
    if (error instanceof NativeRefusal) {
      await record?.refused().catch(() => {});
      return {
        kind: "failed",
        reason: "refused",
        explanation: `Codex refused to create a conversation. ${error.message} No first input was submitted.`,
      };
    }
    const missing = (error as NodeJS.ErrnoException).code === "ENOENT";
    return missing
      ? {
          kind: "failed",
          reason: "not-installed",
          explanation:
            "Codex (`codex`) was not found on this machine. Install and authenticate it, then start again.",
        }
      : {
          kind: "uncertain",
          reason: "unconfirmed",
          explanation:
            "Codex did not provide a trustworthy conversation identity. Check native Codex history before starting again; no second conversation was created automatically.",
        };
  }
};
