// @ts-check
import { setupMarkers } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";

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
    durableCommandEvidence
      ? `require('path').join(__dirname,'..','..',${JSON.stringify(name)})`
      : JSON.stringify(name);
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
