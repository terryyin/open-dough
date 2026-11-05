// A `node --test --test-reporter=<this file>` recorder for `node:test` proof.
// With RECORD_NODE_TEST_PROOF unset it drains events and yields nothing. With
// the option set it maintains latest.json through tests/support/proofStore.mjs
// for covered `runner: "node:test"` locations. Errors stay contained so the
// run's exit and output are unchanged.
import path from "node:path";
import { canonicalPath, identityOf, openProofStore } from "./proofStore.mjs";

function recordingEnabled() {
  return process.env.RECORD_NODE_TEST_PROOF === "1";
}

function silently(action) {
  try {
    action();
  } catch {
    // Proof is best effort; the suite's own failures keep their path.
  }
}

function fileKey(file) {
  return file ? path.resolve(file) : "";
}

/**
 * A case is a finished `details.type === "test"` whose enclosing results are
 * suites or the file. Children that finish before their parent are held until
 * the parent type is known: under a suite they are cases; under a test they
 * are subtests and record nothing.
 */
function createSession(store) {
  const openByFile = new Map();
  const typeByTestId = new Map();
  const pendingByParent = new Map();
  const folds = new Map();

  function stackFor(file) {
    const key = fileKey(file);
    let stack = openByFile.get(key);
    if (!stack) {
      stack = [];
      openByFile.set(key, stack);
    }
    return stack;
  }

  function relativeFileOf(absoluteFile) {
    const root = store.root;
    if (typeof root !== "string" || root.length === 0) return undefined;
    const relative = path
      .relative(canonicalPath(root), canonicalPath(absoluteFile))
      .split(path.sep)
      .join("/");
    if (
      relative.length === 0 ||
      relative.startsWith("..") ||
      path.isAbsolute(relative)
    ) {
      return undefined;
    }
    return relative;
  }

  function suitePathOf(file, nesting, name) {
    const stack = stackFor(file);
    return [...stack.slice(0, nesting).map((entry) => entry.name), name];
  }

  function applyCase(event, kind) {
    if (!event.file) return;
    const relativeFile = relativeFileOf(event.file);
    if (relativeFile === undefined) return;
    const testNames = suitePathOf(event.file, event.nesting, event.name);
    const identity = { file: relativeFile, test: testNames };
    const foldKey = identityOf(identity);
    const fold = folds.get(foldKey) ?? { cleared: false };

    if (kind === "keep") {
      return;
    }

    if (kind === "clear") {
      fold.cleared = true;
      delete fold.observation;
      folds.set(foldKey, fold);
      store.clear(identity);
      return;
    }

    if (fold.cleared) return;

    const durationMs = event.details?.duration_ms ?? 0;
    const finishedAt = new Date().toISOString();
    if (fold.observation === undefined) {
      const fileBlob = store.fileBlob(relativeFile);
      if (fileBlob === undefined || store.commit === undefined) return;
      fold.observation = {
        ...identity,
        outcome: "passed",
        attempts: 1,
        durationMs,
        finishedAt,
        commit: store.commit,
        fileBlob,
      };
    } else {
      fold.observation = {
        ...fold.observation,
        durationMs: fold.observation.durationMs + durationMs,
        finishedAt,
      };
    }
    folds.set(foldKey, fold);
    store.record(fold.observation);
  }

  function classify(event) {
    if (event.skip || event.todo) return "keep";
    if (event.type === "test:pass") return "pass";
    return "clear";
  }

  function handleCaseEvent(event) {
    applyCase(event, classify(event));
  }

  function flushPending(parentId, parentType) {
    const pending = pendingByParent.get(parentId);
    pendingByParent.delete(parentId);
    if (!pending || parentType !== "suite") return;
    for (const child of pending) handleCaseEvent(child);
  }

  function onStart(data) {
    const stack = stackFor(data.file);
    stack.length = data.nesting;
    stack.push({
      name: data.name,
      testId: data.testId,
      parentId: data.parentId,
    });
  }

  function onFinished(type, data) {
    const detailsType = data.details?.type;
    if (detailsType !== "test" && detailsType !== "suite") return;

    typeByTestId.set(data.testId, detailsType);
    flushPending(data.testId, detailsType);

    if (detailsType !== "test") return;

    const event = { type, ...data };
    const parentType = typeByTestId.get(data.parentId);
    if (parentType === "test") {
      // Subtest of an already-finished parent; parent owns the case.
      return;
    }
    if (
      parentType === "suite" ||
      data.parentId === 0 ||
      data.parentId === null ||
      data.parentId === undefined
    ) {
      handleCaseEvent(event);
      return;
    }
    const pending = pendingByParent.get(data.parentId) ?? [];
    pending.push(event);
    pendingByParent.set(data.parentId, pending);
  }

  return {
    onStart,
    onFinished,
  };
}

async function drain(source) {
  for await (const event of source) {
    void event;
  }
}

// Node reporters are async generators; this one never yields (quiet-pass).
// eslint-disable-next-line require-yield -- reporter API; recording must stay silent
export default async function* nodeTestProofReporter(source) {
  try {
    if (!recordingEnabled()) {
      await drain(source);
      return;
    }

    const store = openProofStore({ runner: "node:test" });
    if (!store.active) {
      await drain(source);
      return;
    }

    const session = createSession(store);
    for await (const event of source) {
      silently(() => {
        if (event.type === "test:start") {
          session.onStart(event.data);
        } else if (event.type === "test:pass" || event.type === "test:fail") {
          session.onFinished(event.type, event.data);
        }
      });
    }
  } catch {
    // Never fail the run or print from the recorder.
  }
}
