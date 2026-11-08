// @ts-check
import {
  readyContributing,
  setupMarkers,
} from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { queuedReadyRepository } from "./queued-repository.mjs";

/**
 * A script expression for `name` in the fixture root, which holds the
 * checkout and every workspace beside it, from a script in its `scripts/`.
 * @param {string} name
 */
export const fixtureRootMarker = (name) =>
  `require('path').join(__dirname,'..','..',${JSON.stringify(name)})`;

/**
 * Checkout-relative scripts serve ordinary readiness cases. The durable
 * variant writes to the fixture root shared by the checkout and its siblings.
 * @param {{ contributing: string, durableCommandEvidence?: boolean }} options
 */
export function startupCommandFiles({
  contributing,
  durableCommandEvidence = false,
}) {
  /** @param {string} name */
  const marker = (name) =>
    durableCommandEvidence ? fixtureRootMarker(name) : JSON.stringify(name);
  /** @param {string} name */
  const script = (name) => `require('fs').writeFileSync(${marker(name)},'1')\n`;
  const [setup, command] = /** @type {[string, string]} */ (setupMarkers);
  return {
    "CONTRIBUTING.md": contributing,
    "scripts/setup.js": script(setup),
    "scripts/command.js": script(command),
    "scripts/fail.js": "process.exit(1)\n",
  };
}

/**
 * The native journeys' project files: the ready setup and command leave their
 * markers in the fixture root.
 */
export const readyStartupFiles = startupCommandFiles({
  contributing: readyContributing,
  durableCommandEvidence: true,
});

/**
 * The trunk the native startup, admission and one-shot journeys start from:
 * `queued` stories Ready, with `readyStartupFiles`.
 * @param {{ queued: NonNullable<Parameters<typeof queuedReadyRepository>[0]>["queued"] }} facts
 */
export function queuedReadyStartupRepository({ queued }) {
  return queuedReadyRepository({ queued, files: readyStartupFiles });
}
