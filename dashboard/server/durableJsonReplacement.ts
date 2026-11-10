// Write-ahead operational decisions must survive a process interruption before
// their external side effect. The caller owns locking and temporary cleanup.
import { open, rename } from "node:fs/promises";
import path from "node:path";
export async function replaceDurableJson(
  temporary: string,
  file: string,
  text: string,
): Promise<void> {
  const handle = await open(temporary, "w");
  try {
    await handle.writeFile(text);
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, file);
  const directory = await open(path.dirname(file), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}
