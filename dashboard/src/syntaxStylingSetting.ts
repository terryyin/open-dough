// The syntax-styling choice saved on this machine, shared by Intent source
// reading and story-review diffs; the browser reads and saves only a preset
// id (`./syntaxStylingChoices.ts`).
import type { SyntaxStylingId } from "./syntaxStylingChoices.ts";

export const syntaxStylingEndpoint = "/__syntax-styling";
export const syntaxStylingSaveEndpoint = `${syntaxStylingEndpoint}/save`;
export type SyntaxStylingSetting = { readonly styling: SyntaxStylingId };
