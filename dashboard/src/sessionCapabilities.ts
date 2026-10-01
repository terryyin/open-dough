// Delivered host capabilities shared by every session presentation/action.
import type { SessionReference } from "./sessionReference.ts";
export const launchHosts = ["claude", "codex"] as const;
export function hostName(host: SessionReference["host"]): string {
  return host === "claude"
    ? "Claude Code"
    : host === "codex"
      ? "Codex"
      : "Cursor";
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
