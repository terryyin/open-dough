// The responses one import read, written on request to a file the developer
// names. It is output for inspection: the native files stay the evidence, and
// nothing reads this file back into the usage history.
import { createWriteStream } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import { finished } from "node:stream/promises";
import type { UsageAssociation, UsageObservation } from "./usageRecords.ts";

export type UsageResponses = {
  observations: Record<string, UsageObservation>;
  associations: Record<string, UsageAssociation>;
};

// One response at a time, so no whole-scan string is built.
export async function writeUsageResponses(
  file: string,
  observations: Iterable<UsageObservation>,
  associations: Iterable<UsageAssociation>,
): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const partial = `${file}.${process.pid}.partial`;
  const output = createWriteStream(partial);
  const write = async (text: string) => {
    if (!output.write(text)) await once(output, "drain");
  };
  const collection = async <Value>(
    name: keyof UsageResponses,
    values: Iterable<Value>,
    key: (value: Value) => string,
  ) => {
    await write(`${JSON.stringify(name)}:{`);
    let separator = "";
    for (const value of values) {
      await write(
        `${separator}${JSON.stringify(key(value))}:${JSON.stringify(value)}`,
      );
      separator = ",";
    }
    await write("}");
  };
  await write("{");
  await collection("observations", observations, (value) => value.id);
  await write(",");
  await collection(
    "associations",
    associations,
    (value) => value.observationId,
  );
  output.end("}\n");
  await finished(output);
  await rename(partial, file);
}
