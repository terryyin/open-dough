// Typed projections of the canonical JavaScript readers. Validation checks the
// result fields used here; canonical parsing and identity rules stay upstream.
import { z } from "zod";
import {
  readHome,
  namedIdentity,
  discoveryCandidates,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs";
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
