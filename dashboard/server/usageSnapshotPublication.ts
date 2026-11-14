// All pages are durable before the one small manifest is published. Failed
// publications may leave harmless unreferenced pages, never a partial snapshot.
import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { replaceDurableJson } from "./durableJsonReplacement.ts";
import { recordMachineJsonReplacement } from "./machineDocumentsRevision.ts";
import { pageDirectory, type Manifest, type Row } from "./usageSnapshot.ts";
export async function publishPartition(
  file: string,
  rows: Row[],
  pageBytes = 1024 * 1024,
): Promise<string[]> {
  const names: string[] = [];
  let pending: string[] = [];
  let bytes = 2;
  async function flush() {
    if (!pending.length) return;
    const text = `[${pending.join(",")}]`;
    const name = `${createHash("sha256").update(text).digest("hex")}.json`;
    const destination = path.join(pageDirectory(file), name);
    try {
      await access(destination);
    } catch {
      const temporary = `${destination}.${randomUUID()}.tmp`;
      try {
        await replaceDurableJson(temporary, destination, text);
      } finally {
        await rm(temporary, { force: true });
      }
    }
    names.push(name);
    pending = [];
    bytes = 2;
  }
  for (const row of rows.sort((a, b) => a[2] - b[2])) {
    const text = JSON.stringify(row);
    const size = Buffer.byteLength(text) + 1;
    if (bytes + size > pageBytes) await flush();
    pending.push(text);
    bytes += size;
  }
  await flush();
  return names;
}
export async function publishManifest(file: string, manifest: Manifest) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await replaceDurableJson(temporary, file, `${JSON.stringify(manifest)}\n`);
    recordMachineJsonReplacement();
  } finally {
    await rm(temporary, { force: true });
  }
}
export async function prepareSnapshotDirectory(file: string) {
  await mkdir(path.dirname(file), { recursive: true });
  await mkdir(pageDirectory(file), { recursive: true });
}
