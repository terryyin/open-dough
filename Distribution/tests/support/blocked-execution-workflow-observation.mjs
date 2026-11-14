import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { appendFileSync, existsSync, readFileSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { captureInvoiceAccounting } from "./blocked-execution-invoice-accounting.mjs";
import { readInvoiceHistory } from "./blocked-execution-invoice-history.mjs";
import { CodexConnection } from "../../src/skills/dough-execute-plan/scripts/codex-rpc.mjs";
import { InvoiceTurnOwnership } from "./blocked-execution-workflow-ownership.mjs";

export class InvoiceNativeObservation extends EventEmitter {
  constructor(root, endpoint, limits) {
    super();
    this.root = root;
    this.limits = limits;
    this.events = [];
    this.threads = new Map();
    this.ancestry = new Map();
    this.histories = new Map();
    this.historyLimits = new Map();
    this.noticeCounts = new Map();
    this.watches = [];
    this.watched = new Set();
    this.failure = undefined;
    this.connection = new CodexConnection(
      endpoint,
      new AbortController().signal,
    );
    this.ownership = new InvoiceTurnOwnership(root, this.connection);
    this.connection.on("notification", (message) =>
      this.handleNotification(message),
    );
    this.connection.on("disconnect", () =>
      this.fail(new Error("Native observation disconnected")),
    );
    this.deadline = setTimeout(
      () =>
        this.fail(new Error("Approved native observation duration exceeded")),
      limits.minutes * 60_000,
    );
  }

  fail(error) {
    this.failure ??= error;
    this.emit("change");
  }

  handleNotification(message) {
    const id = message.params?.threadId ?? message.params?.thread?.id;
    if (!id) {
      if (message.method === "error") {
        this.fail(
          new Error(
            `Native observation error: ${JSON.stringify(message.params)}`,
          ),
        );
        return;
      }
      this.noticeCounts.set(
        message.method,
        (this.noticeCounts.get(message.method) ?? 0) + 1,
      );
      return;
    }
    this.events.push(message);
    appendFileSync(
      join(this.root, "native-events.jsonl"),
      `${JSON.stringify(message)}\n`,
    );
    if (!this.ancestry.has(id)) return;
    this.observeOwnedEvent(message);
    if (message.method === "thread/tokenUsage/updated")
      this.accounting().catch((error) => this.fail(error));
    this.emit("change");
  }

  admitThread(id, parent) {
    if (parent !== null)
      assert.ok(this.ancestry.has(parent), "verified native parent required");
    if (this.ancestry.has(id)) {
      assert.equal(
        this.ancestry.get(id),
        parent,
        "native admission cannot reparent an owned thread",
      );
      return;
    }
    this.ancestry.set(id, parent);
    for (const event of this.events)
      if (event.params?.threadId === id || event.params?.thread?.id === id)
        this.observeOwnedEvent(event);
  }

  observeOwnedEvent(message) {
    const id = message.params?.threadId ?? message.params?.thread?.id;
    if (!this.ancestry.has(id)) return;
    if (message.method === "thread/started")
      this.trackRollout(message.params.thread);
    if (["turn/started", "turn/completed"].includes(message.method))
      this.ownership.observed(id, message.params.turn);
    const children =
      message.method === "item/completed"
        ? spawnedThreads(message.params.item, id)
        : [];
    for (const child of children) this.admitThread(child, id);
  }

  observePath(path) {
    if (this.watched.has(path)) return;
    this.watched.add(path);
    const watcher = watch(path, () => this.emit("change"));
    watcher.on("error", (error) => this.fail(error));
    this.watches.push(watcher);
  }

  async until(predicate) {
    while (true) {
      if (this.failure) throw this.failure;
      let listener;
      const changed = new Promise((resolve) => {
        listener = resolve;
        this.once("change", listener);
      });
      try {
        const value = await predicate();
        if (value) return value;
        await changed;
      } finally {
        this.off("change", listener);
      }
    }
  }

  hold(directory) {
    if (existsSync(directory)) this.observePath(directory);
    const path = join(directory, "hold.json");
    if (!existsSync(path)) return undefined;
    return JSON.parse(readFileSync(path));
  }

  history(threadId, name) {
    return readInvoiceHistory(this, threadId, name);
  }

  trackRollout(thread) {
    if (!thread.path) return;
    this.threads.set(thread.id, thread.path);
    if (!existsSync(thread.path)) {
      this.observePath(dirname(thread.path));
    } else if (!this.watched.has(thread.path)) {
      this.watched.add(thread.path);
      const watcher = watch(thread.path, () => {
        this.accounting().catch((error) => this.fail(error));
        this.emit("change");
      });
      this.watches.push(watcher);
    }
  }

  completed(threadId, turnId) {
    return this.events.some(
      (event) =>
        event.method === "turn/completed" &&
        event.params?.threadId === threadId &&
        (!turnId || event.params.turn?.id === turnId),
    );
  }

  executionItems() {
    return [
      ...this.events
        .filter(
          (event) =>
            event.method === "item/completed" &&
            this.ancestry.has(event.params?.threadId),
        )
        .map((event) => event.params.item),
      ...[...this.histories.values()].flatMap((thread) =>
        thread.turns.flatMap(
          (turn) =>
            turn.items?.filter((item) => item.type === "commandExecution") ??
            [],
        ),
      ),
    ].filter(Boolean);
  }

  async accounting() {
    const result = captureInvoiceAccounting(this);
    if (
      result.observedTotalTokens > this.limits.tokens ||
      result.observedOutputTokens > this.limits.output
    )
      this.fail(new Error("Approved native aggregate token ceiling exceeded"));
    return result;
  }

  async discoverWorkers(threadId) {
    const pending = [threadId];
    const visited = new Set();
    while (pending.length) {
      const id = pending.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      const history = await this.history(id);
      for (const turn of history.turns)
        for (const item of turn.items ?? [])
          for (const child of spawnedThreads(item, id)) {
            this.admitThread(child, id);
            pending.push(child);
          }
    }
  }

  close() {
    clearTimeout(this.deadline);
    for (const watcher of this.watches) watcher.close();
    this.connection.removeAllListeners("disconnect");
    this.connection.close();
  }
}

// Native sender identity is the same rule for live, retained and history evidence.
function spawnedThreads(item, sender) {
  return item?.type === "collabAgentToolCall" &&
    item.tool === "spawnAgent" &&
    item.senderThreadId === sender
    ? (item.receiverThreadIds ?? [])
    : [];
}
