// Delivered host capabilities shared by every session presentation/action.
import type { SessionReference } from "./sessionReference.ts";
import { hostDescription } from "./hostDescription.ts";
export { launchHosts } from "./hostDescription.ts";
export function hostName(host: SessionReference["host"]): string {
  return hostDescription(host).name;
}
export function embeddedTerminal(host: SessionReference["host"]): boolean {
  return host === "claude" || host === "codex";
}
export function marksDone(host: SessionReference["host"]): boolean {
  return host === "claude" || host === "codex";
}
export function shellCommand(args: readonly string[]): string {
  return args.map((part) => `'${part.replaceAll("'", "'\\''")}'`).join(" ");
}
