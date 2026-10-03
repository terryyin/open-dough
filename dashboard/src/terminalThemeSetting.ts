// The terminal theme saved on this machine, shared by dev and preview; the
// browser reads and saves only a preset id (`./terminalThemes.ts`).
import type { TerminalThemeId } from "./terminalThemes.ts";

export const terminalThemeEndpoint = "/__terminal-theme";
export const terminalThemeSaveEndpoint = `${terminalThemeEndpoint}/save`;
export type TerminalThemeSetting = { readonly theme: TerminalThemeId };
