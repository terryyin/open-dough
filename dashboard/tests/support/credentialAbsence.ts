// Shared assertions that a credential-like env marker never reaches browser
// requests, responses, storage, DOM, or built preview assets.

import { expect } from "@playwright/test";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

export function collectFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...collectFiles(full));
    } else {
      found.push(full);
    }
  }
  return found;
}

export function assertNoCredentialMarker(
  marker: string,
  haystacks: readonly string[],
): void {
  for (const haystack of haystacks) {
    expect(haystack).not.toContain(marker);
  }
}
