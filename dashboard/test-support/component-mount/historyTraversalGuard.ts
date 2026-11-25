// Keeps each mounted Vitest file's history traversals inside its own tester
// frame (../../frontend.vitest.config.mts `setupFiles`).
//
// A tester iframe shares its session history with the top-level Vitest
// orchestrator page. A Back past the frame's first entry navigates that page
// away, which closes the orchestrator's connection and silently drops every
// file still queued on it (VITEST_BROWSER_CONNECTION_CLOSED, "createTesters").
// The guard refuses such a traversal before it reaches the shared history:
// the call throws, and the case that made it fails under its own name even
// when app code swallowed the throw.
import { afterEach } from "vitest";

export const excessTraversalMessage =
  "Excess history traversal: it would leave this test frame's own entries and navigate the Vitest orchestrator page";

const refused: string[] = [];
let expectedIndex = 0;
let pendingTraversals = 0;

// The frame's entry index once its pending traversals settle: a traversal is
// asynchronous, so back-to-back calls count from where the last one lands.
function frameIndex() {
  return pendingTraversals > 0
    ? expectedIndex
    : (navigation.currentEntry?.index ?? 0);
}

function traverse(delta: number, how: string, go: (delta: number) => void) {
  const index = frameIndex();
  const target = index + delta;
  if (delta !== 0 && target < 0) {
    const message = `${excessTraversalMessage} (${how} from entry ${index} of this frame).`;
    refused.push(message);
    throw new Error(message);
  }
  if (delta !== 0) {
    expectedIndex = Math.min(target, navigation.entries().length - 1);
    pendingTraversals++;
  }
  go(delta);
}

navigation.addEventListener("currententrychange", (event) => {
  if (event.navigationType === "traverse")
    pendingTraversals = Math.max(0, pendingTraversals - 1);
  else pendingTraversals = 0;
});

const history = window.history;
const go = history.go.bind(history);
history.back = () => {
  traverse(-1, "Back", go);
};
history.forward = () => {
  traverse(1, "Forward", go);
};
history.go = (delta = 0) => {
  traverse(delta, `go(${delta})`, go);
};

/** The refused traversals since the last call, which a case expecting them claims. */
export function takeRefusedTraversals() {
  return refused.splice(0);
}

afterEach(() => {
  const unclaimed = takeRefusedTraversals();
  if (unclaimed.length) throw new Error(unclaimed.join("\n"));
});
