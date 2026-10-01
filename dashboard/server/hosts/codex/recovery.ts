// Reconcile only this saved native conversation. Absence never proves rejection.
import { z } from "zod";
import type { LaunchHost } from "../../launchHosts.ts";
import { codexInput, confirmedFirstInput } from "./input.ts";
import { NativeRefusal } from "./rpc.ts";
import { connection, observe, retire } from "./conversation.ts";
import { materializeBlank } from "./blank.ts";
const historySchema = z.object({
  thread: z.object({
    id: z.string(),
    cwd: z.string(),
    turns: z.array(
      z.object({
        id: z.string().min(1),
        status: z.string().optional(),
        items: z.array(
          z.object({ type: z.string(), content: z.unknown().optional() }),
        ),
      }),
    ),
  }),
});
const userContent = z.array(
  z.object({ type: z.string(), text: z.string().optional() }),
);
const uncertain = (explanation: string) =>
  ({ kind: "uncertain", reason: "unconfirmed", explanation }) as const;
export const recoverCodex: NonNullable<LaunchHost["recover"]> = async (
  record,
  signal,
  recording,
) => {
  const session = record.session;
  const continuation = session.continuation;
  let evidence = record.firstInput;
  if (
    continuation === undefined ||
    evidence === undefined ||
    (evidence.intent !== "blank" && evidence.instruction === undefined)
  )
    return uncertain(
      "The saved first-input intent is unavailable. Continue this recorded Codex conversation; no input was resent.",
    );
  const rpc = connection(continuation.endpoint, signal);
  rpc.watchThread(session.sessionId);
  const inspect = (value: unknown) => {
    const parsed = historySchema.parse(value).thread;
    if (
      parsed.id !== session.sessionId ||
      parsed.cwd !== continuation.workspace
    )
      throw new Error(
        "Native conversation identity or workspace differs from the saved launch.",
      );
    return parsed;
  };
  try {
    await rpc.initialize();
    if (evidence.intent === "blank") {
      await materializeBlank(rpc, session.sessionId, continuation.workspace);
      await recording.session(session, {
        state: "not-requested",
        intent: "blank",
      });
      retire(rpc);
      return { kind: "launched", session, sessionState: { kind: "unknown" } };
    }
    const read = inspect(
      await rpc.request("thread/read", {
        threadId: session.sessionId,
        includeTurns: true,
      }),
    );
    // Resume by ID alone preserves native model, policy and workspace.
    const resumed = inspect(
      await rpc.request("thread/resume", { threadId: session.sessionId }),
    );
    const matching = [...resumed.turns, ...read.turns].find((turn) =>
      turn.items.some(
        (item) =>
          item.type === "userMessage" &&
          userContent
            .safeParse(item.content)
            .data?.some(
              (part) =>
                part.type === "text" && part.text === evidence?.instruction,
            ),
      ),
    );
    if (matching !== undefined) {
      evidence = confirmedFirstInput(evidence, matching.id);
    } else if (
      evidence.state === "awaiting" &&
      read.turns.length === 0 &&
      resumed.turns.length === 0
    ) {
      // Awaiting is durable proof of no submission (or explicit native refusal),
      // not an inference from empty history. Save uncertainty before retry.
      evidence = {
        ...evidence,
        state: "uncertain",
        explanation:
          "Submitting the saved first input to the resumed conversation; acceptance is not yet acknowledged.",
      };
      await recording.session(session, evidence);
      try {
        const accepted = z
          .object({ turn: z.object({ id: z.string().min(1) }) })
          .parse(
            await rpc.request("turn/start", {
              threadId: session.sessionId,
              input: codexInput(
                record.request,
                continuation.workspace,
                undefined,
                evidence.instruction,
              ),
            }),
          );
        evidence = confirmedFirstInput(evidence, accepted.turn.id);
      } catch (error) {
        if (error instanceof NativeRefusal) {
          evidence = {
            ...evidence,
            state: "awaiting",
            explanation:
              "Codex explicitly refused this input; the saved conversation remains available.",
          };
          await recording.session(session, evidence);
        }
        throw error;
      }
    } else {
      retire(rpc);
      return uncertain(
        "Native history does not establish acceptance of this launch's input. Continue the saved Codex conversation; no input was resent and no new conversation was created.",
      );
    }
    await recording.session(session, evidence);
    if (
      matching?.status !== undefined &&
      ["completed", "interrupted", "failed"].includes(matching.status)
    )
      retire(rpc);
    else observe(rpc, session, evidence, recording);
    return { kind: "launched", session, sessionState: { kind: "unknown" } };
  } catch {
    retire(rpc);
    return uncertain(
      "The saved Codex conversation could not be reconciled. Its identity, workspace and continuation remain kept; no new conversation was created and uncertain input was not resent blindly.",
    );
  }
};
