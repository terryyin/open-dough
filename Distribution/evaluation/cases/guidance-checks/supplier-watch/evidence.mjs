// Case-specific compact watch evidence, always derived through the shared
// reader. Generic live handles are candidates; resource identity needs review.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readCodexSession } from "../../../src/native-host-stream.mjs";
const hash = (v) =>
  typeof v === "string" ? createHash("sha256").update(v).digest("hex") : null;
const ms = (at) => (Number.isFinite(Date.parse(at)) ? Date.parse(at) : null);
const fields = (text) =>
  new Map(
    text.split("\n").flatMap((line) => {
      const match = /^([a-z0-9-]+): (.*)$/.exec(line);
      return match ? [[match[1], match[2]]] : [];
    }),
  );
export function captureWatch(file, observations) {
  const input =
    typeof observations === "string" ? fields(observations) : observations;
  const publications = [1, 2].map((number) => ({
    number,
    event: input.get(`turn-2-publication-${number}-event`) ?? null,
    sha: input.get(`turn-2-publication-${number}-sha`) ?? null,
    beginMs: Number(input.get(`turn-2-publication-${number}-begin-ms`)) || null,
    ms: Number(input.get(`turn-2-publication-${number}-ms`)) || null,
  }));
  const start = Number(input.get("turn-2-watch-start-ms")) || null;
  let session = null;
  try {
    session = file && existsSync(file) ? readCodexSession(file) : null;
  } catch {
    /* A truncated/private source remains unknown, never zero. */
  }
  const turn = session?.startedTurns[1];
  const end = session?.lifecycle.find(
    (e) => e.turn === turn && e.type === "task_complete",
  );
  const handles = (session?.handles ?? [])
    .filter((h) => h.turn === turn)
    .map((h) => ({
      id: hash(`${session.thread}:${h.sessionId}`),
      commandHash: hash(h.command),
      callId: hash(h.callId),
      receiptId: hash(h.receiptId),
      responseId: hash(h.responseId),
      launchOrder: h.order,
      receiptOrder: h.receiptOrder,
      launchMs: ms(h.receiptAt),
      endReceiptMs: ms(h.endedAt),
      lastLiveMs: Math.max(
        ms(h.receiptAt) ?? 0,
        ...(session.waits ?? [])
          .filter(
            (w) =>
              w.launchCallId === h.callId &&
              w.sessionId === h.sessionId &&
              w.status === "live",
          )
          .map((w) => ms(w.receiptAt) ?? 0),
      ),
    }));
  const waits = (session?.waits ?? [])
    .filter((w) => w.turn === turn)
    .map((w) => ({
      handle: hash(`${session.thread}:${w.sessionId}`),
      launchCallId: hash(w.launchCallId),
      callId: hash(w.callId),
      receiptId: hash(w.receiptId),
      responseId: hash(w.responseId),
      order: w.order,
      receiptOrder: w.receiptOrder,
      receiptMs: ms(w.receiptAt),
      status: w.status,
      empty: w.empty,
      nextResponseId: hash(w.nextResponseId),
      nextResponseOrder: w.nextResponseOrder,
      nextResponseMs: ms(w.nextResponseAt),
    }));
  const responses = (session?.usage ?? [])
    .filter((u) => u.thread === session.thread && u.turn === turn)
    .map((u) => ({ id: hash(u.responseId), order: u.order, ms: ms(u.at) }));
  const unsupported =
    (session?.unresolvedTools ?? []).filter((t) => t.turn === turn).length +
    (session?.tools ?? []).filter(
      (t) =>
        t.turn === turn &&
        (t.thread !== session.thread ||
          t.receiptThread !== session.thread ||
          t.receiptTurn !== turn ||
          !t.responseId ||
          !t.receiptId),
    ).length;
  return {
    status: turn && responses.length ? "observed" : "unknown",
    thread: hash(session?.thread),
    turn: hash(turn),
    start,
    end: ms(end?.at),
    publications,
    handles,
    waits,
    responses,
    unsupported,
  };
}
export function watchFields(evidence) {
  const e = evidence,
    out = new Map();
  const validMs = (value) => Number.isSafeInteger(value) && value > 0;
  const [first, second] = e.publications;
  const known =
    e.status === "observed" &&
    validMs(e.start) &&
    e.responses.every((r) => r.id && Number.isSafeInteger(r.ms)) &&
    e.publications.every((p) => validMs(p.beginMs) && validMs(p.ms)) &&
    e.start < first.beginMs &&
    first.beginMs <= first.ms &&
    first.ms < second.beginMs &&
    second.beginMs <= second.ms;
  let signal = false;
  for (let index = 0; index < 2; index++) {
    const start = index ? first.ms : e.start,
      end = e.publications[index].beginMs;
    const counts = new Map();
    for (const w of e.waits) {
      if (
        w.status === "live" &&
        w.empty &&
        w.receiptMs >= start &&
        w.nextResponseMs < end &&
        w.nextResponseMs >= w.receiptMs &&
        w.nextResponseId &&
        w.launchCallId &&
        w.receiptId
      ) {
        const key = w.handle;
        if (!counts.has(key)) counts.set(key, new Set());
        counts.get(key).add(w.nextResponseId);
      }
    }
    signal ||= [...counts.values()].some((responses) => responses.size >= 2);
    out.set(
      `turn-2-window-${index + 1}-responses`,
      known
        ? String(
            new Set(
              e.responses
                .filter((r) => r.ms >= start && r.ms < end)
                .map((r) => r.id),
            ).size,
          )
        : "unknown",
    );
    const exposures = e.handles
      .filter((h) => h.launchMs !== null)
      .map((h) =>
        Math.max(0, Math.min(end, h.lastLiveMs) - Math.max(start, h.launchMs)),
      );
    out.set(
      `turn-2-window-${index + 1}-candidate-confirmed-live-ms`,
      known && exposures.length ? String(Math.max(...exposures)) : "unknown",
    );
  }
  out.set(
    "turn-2-watch-exposure",
    known && e.handles.length ? "confirmed-candidate-spans" : "unknown",
  );
  out.set(
    "turn-2-watch-candidate-signal",
    known && signal
      ? "present"
      : known &&
          !e.unsupported &&
          e.waits.every((w) => w.status !== "unknown" && w.empty !== null)
        ? "absent"
        : "unknown",
  );
  return out;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, observations, destination] = process.argv.slice(2);
  const evidence = captureWatch(file, readFileSync(observations, "utf8"));
  writeFileSync(destination, `${JSON.stringify(evidence)}\n`);
  for (const [key, value] of watchFields(evidence))
    console.log(`${key}: ${value}`);
}
