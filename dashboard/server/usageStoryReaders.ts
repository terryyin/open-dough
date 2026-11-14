// Typed projections of the canonical JavaScript readers. Validation checks the
// result fields used here; canonical parsing and identity rules stay upstream.
import { z } from "zod";
import {
  readHome,
  namedIdentity,
  discoveryCandidates,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs";
import { unfencedPlanLines } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
import { parseBacklog } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";

const discoveredHome = z.object({
  anchors: z.array(z.string()),
  wholeDocument: z.boolean(),
});
const canonicalHome = z.object({
  anchor: z.string(),
  documentId: z.string(),
  recorded: z.object({ identity: z.string() }).optional(),
  document: z.object({ lines: z.array(z.string()) }),
  region: z.object({ heading: z.number().int().nonnegative() }),
});
const canonicalBacklog = z.object({
  entries: z.array(
    z.object({
      identity: z.string(),
      title: z.string(),
      href: z.string(),
    }),
  ),
});
export function usageHomeDiscovery(text: string) {
  return discoveredHome.parse(discoveryCandidates(text));
}
export function usageHome(text: string, href: string) {
  const home = canonicalHome.parse(readHome(text, href));
  const identity = z.string().optional().parse(namedIdentity(home));
  const heading = home.document.lines[home.region.heading];
  return { identity, title: heading?.replace(/^#{1,6} +/, "") ?? null };
}
export function usageBacklogEntries(text: string) {
  return canonicalBacklog.parse(parseBacklog(text)).entries;
}
// Preserve line boundaries while excluding examples using the canonical Markdown
// fence rules, shared by invocation context and historical plan-source reads.
export function usageUnfencedText(text: string) {
  const lines = text.split(/\r?\n/);
  const unfenced = z.array(z.boolean()).parse(unfencedPlanLines(lines));
  return lines.map((line, index) => (unfenced[index] ? line : "")).join("\n");
}
// Older quick plans record their source under a heading rather than an inline
// label. Identity parsing remains with readHome/namedIdentity above.
export function usagePlanSources(text: string, href: string) {
  const readable = usageUnfencedText(text);
  const references: string[] = [];
  try {
    const identity = usageHome(readable, href).identity;
    if (identity) references.push(identity);
  } catch {
    /* An older plan can have only a source link. */
  }
  const inline = readable.match(/^\*\*Source:\*\*([^\n]*)/m)?.[1];
  const section = readable.match(
    /^## Source and outcome\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m,
  )?.[1];
  for (const match of (inline ?? section ?? "").matchAll(
    /\[[^\]]+\]\(([^)]+)\)/g,
  ))
    if (match[1]) references.push(match[1]);
  return [...new Set(references)];
}
