// Native ownership for this opt-in invoice example, including startup races.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function invoiceSessionReady(path, threadId) {
  if (!path || !existsSync(path)) return false;
  const bytes = readFileSync(path, "utf8");
  const newline = bytes.indexOf("\n");
  if (newline < 0) return false;
  const record = JSON.parse(bytes.slice(0, newline));
  assert.equal(record.type, "session_meta");
  assert.equal(
    record.payload.id,
    threadId,
    "exact own persisted session required",
  );
  return true;
}

const terminal = (status) =>
  ["completed", "failed", "interrupted"].includes(status);

export class InvoiceTurnOwnership {
  constructor(root, connection) {
    this.root = root;
    this.connection = connection;
    this.turns = new Map();
    this.disconnected = false;
    connection.on("disconnect", () => {
      this.disconnected = true;
    });
  }

  accepted(threadId, turn, purpose) {
    assert.ok(
      turn?.id,
      "native accepted turn identity is required immediately",
    );
    const key = `${threadId}:${turn.id}`;
    const previous = this.turns.get(key);
    this.turns.set(key, {
      threadId,
      turnId: turn.id,
      purpose: purpose ?? previous?.purpose,
      status: terminal(previous?.status) ? previous.status : turn.status,
      acceptedReceipt: true,
    });
    this.save();
    return turn.id;
  }

  observed(threadId, turn) {
    if (!turn?.id) return;
    const key = `${threadId}:${turn.id}`;
    const previous = this.turns.get(key);
    if (terminal(previous?.status) || previous?.status === turn.status) return;
    this.turns.set(key, {
      ...previous,
      threadId,
      turnId: turn.id,
      status: turn.status,
    });
    this.save();
  }

  save() {
    writeFileSync(
      join(this.root, "owned-native-turns.json"),
      `${JSON.stringify([...this.turns.values()], null, 2)}\n`,
    );
  }

  async interruptKnown(admittedThreads) {
    const results = [];
    const recovery =
      "Reconcile each exact retained native thread/turn against its history before claiming terminal or resending input; preserve owned-native-turns.json.";
    const unconfirmed = (value, reason) => ({
      status: "unconfirmed",
      threadId: value.threadId,
      turnId: value.turnId,
      reason,
      recovery,
    });
    // Map iteration includes a verified child accepted during parent interruption.
    for (const value of this.turns.values()) {
      if (terminal(value.status)) continue;
      if (this.disconnected) {
        results.push(
          unconfirmed(
            value,
            "Native route disconnected; interruption is unconfirmed.",
          ),
        );
        continue;
      }
      let listener, lost, event;
      const completion = new Promise((accept) => {
        listener = (message) => {
          if (
            message.method === "turn/completed" &&
            message.params?.threadId === value.threadId &&
            message.params.turn?.id === value.turnId
          ) {
            event = message;
            this.observed(value.threadId, message.params.turn);
            accept();
          }
        };
        lost = () => accept();
        this.connection.on("notification", listener);
        this.connection.on("disconnect", lost);
      });
      try {
        let refusal;
        try {
          await this.connection.request("turn/interrupt", {
            threadId: value.threadId,
            turnId: value.turnId,
          });
        } catch (error) {
          refusal = error;
        }
        if (!event && !refusal && !this.disconnected) await completion;
        if (event) results.push(event);
        else
          results.push(
            unconfirmed(
              value,
              this.disconnected
                ? "Native route disconnected before a terminal event; interruption is unconfirmed."
                : `Interrupt refused without exact terminal evidence: ${refusal}`,
            ),
          );
      } finally {
        this.connection.off("notification", listener);
        this.connection.off("disconnect", lost);
      }
    }
    const remaining = [...this.turns.values()].filter(
      (value) => !terminal(value.status),
    );
    const knownThreads = new Set(
      [...this.turns.values()].map((value) => value.threadId),
    );
    const unknownThreads = [...(admittedThreads ?? knownThreads)].filter(
      (id) => !knownThreads.has(id),
    );
    for (const threadId of unknownThreads)
      results.push(
        unconfirmed(
          { threadId },
          "Admitted native ownership has no observed turn or terminal history.",
        ),
      );
    writeFileSync(
      join(this.root, "native-cleanup-status.json"),
      `${JSON.stringify(
        {
          status:
            remaining.length || unknownThreads.length
              ? "unconfirmed"
              : "confirmed-terminal",
          results,
          remaining,
          unknownThreads,
          recovery,
        },
        null,
        2,
      )}\n`,
    );
    return results;
  }
}
