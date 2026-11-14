import { realpathSync } from "node:fs";
import { CodexConnection } from "./codex-rpc.mjs";

const settingKeys = [
  "cwd",
  "model",
  "modelProvider",
  "approvalPolicy",
  "approvalsReviewer",
  "sandbox",
  "activePermissionProfile",
  "reasoningEffort",
  "runtimeWorkspaceRoots",
  "serviceTier",
];
const settingsOf = (value) =>
  Object.fromEntries(settingKeys.map((key) => [key, value[key]]));
export const terminalTurn = (turn) =>
  ["completed", "failed", "interrupted"].includes(turn?.status);

export class HeldCodexConnection extends CodexConnection {
  constructor(input, signal) {
    super(input.continuation.endpoint, signal);
    this.input = input;
  }

  inspectHistory(value) {
    const thread = value?.thread;
    if (
      thread?.id !== this.input.continuation.threadId ||
      realpathSync(thread.cwd) !== this.input.execution.workspace ||
      !Array.isArray(thread.turns)
    ) {
      throw new Error(
        "Native execution identity or workspace differs from the retained hold.",
      );
    }
    return thread;
  }

  async history() {
    return this.inspectHistory(
      await this.request("thread/read", {
        threadId: this.input.continuation.threadId,
        includeTurns: true,
      }),
    );
  }

  async snapshot() {
    if (!this.initialized) {
      await this.initialize({
        name: "open_dough_held_execution",
        version: "1",
      });
      this.initialized = true;
    }
    const history = await this.history();
    const resumed = await this.request("thread/resume", {
      threadId: history.id,
    });
    this.inspectHistory({ thread: { ...history, cwd: resumed.cwd } });
    return {
      settings: settingsOf(resumed),
      turnIds: history.turns.map((turn) => turn.id),
    };
  }

  async ready(snapshot) {
    const history = await this.history();
    if (
      JSON.stringify(history.turns.map((turn) => turn.id)) !==
      JSON.stringify(snapshot.turnIds)
    ) {
      throw new Error(
        "Another native turn appeared; reconcile the held owner before delivery.",
      );
    }
    const resumed = await this.request("thread/resume", {
      threadId: history.id,
    });
    if (
      JSON.stringify(settingsOf(resumed)) !== JSON.stringify(snapshot.settings)
    ) {
      throw new Error(
        "Native configuration changed; no continuation was submitted.",
      );
    }
    return history.turns.every(terminalTurn);
  }

  async submit(text) {
    const result = await this.request("turn/start", {
      threadId: this.input.continuation.threadId,
      input: [{ type: "text", text }],
    });
    if (typeof result?.turn?.id !== "string" || !result.turn.id) {
      throw new Error("Native continuation acceptance is uncertain.");
    }
    return result.turn;
  }

  async accepted(text) {
    const history = await this.history();
    const matches = history.turns.filter((turn) =>
      turn.items?.some(
        (item) =>
          item.type === "userMessage" &&
          item.content?.some(
            (part) => part.type === "text" && part.text === text,
          ),
      ),
    );
    return matches.length === 1 ? matches[0] : undefined;
  }
}
