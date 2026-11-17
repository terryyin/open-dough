// The Off|Default syntax-styling choices System settings offers for Intent
// source reading and story-review diffs on this machine
// (`./syntaxStylingSetting.ts`). Ids are stable and saved; labels are what
// the developer sees. Missing or absent file means Default.
export const syntaxStylingIds = ["off", "default"] as const;
export type SyntaxStylingId = (typeof syntaxStylingIds)[number];

export function isSyntaxStylingId(value: unknown): value is SyntaxStylingId {
  return (
    typeof value === "string" &&
    (syntaxStylingIds as readonly string[]).includes(value)
  );
}

export const syntaxStylingChoices: Readonly<
  Record<SyntaxStylingId, { readonly label: string }>
> = {
  off: { label: "Off" },
  default: { label: "Default" },
};
