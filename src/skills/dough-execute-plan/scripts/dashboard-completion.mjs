#!/usr/bin/env node
// Standalone installed reporting operation: no dependency on a retired CWD.
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import { readFile } from "node:fs/promises";

export async function reportCompletion(argv) {
  const values = {};
  const allowed = new Set([
    "origin",
    "source",
    "host",
    "reference",
    "session",
    "outcome",
    "message-file",
  ]);
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]?.replace(/^--/, "");
    if (
      !argv[index]?.startsWith("--") ||
      !allowed.has(name) ||
      values[name] !== undefined ||
      !argv[index + 1]
    )
      throw new Error("Malformed reporting arguments.");
    values[name] = argv[index + 1];
  }
  for (const name of [
    "origin",
    "source",
    "host",
    "reference",
    "outcome",
    "message-file",
  ])
    if (!values[name]) throw new Error(`Missing --${name}.`);
  const origin = new URL(values.origin);
  if (
    origin.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname) ||
    origin.origin !== values.origin ||
    origin.username ||
    origin.password
  )
    throw new Error("The reporting origin must be a loopback HTTP origin.");
  const message = await readFile(values["message-file"], "utf8");
  const response = await fetch(`${origin.origin}/__agent-launch/completion`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin.origin },
    body: JSON.stringify({
      source: values.source,
      host: values.host,
      reference: values.reference,
      ...(values.session ? { session: values.session } : {}),
      outcome: values.outcome,
      message,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const receipt = await response.json();
  if (!response.ok) throw new Error(receipt.error ?? "Reporting was refused.");
  if (
    !receipt.receipt ||
    receipt.reference !== values.reference ||
    !["recorded", "pending-native-session"].includes(receipt.state)
  )
    throw new Error("No matching completion receipt was received.");
  return receipt;
}
if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  reportCompletion(process.argv.slice(2)).then(
    (receipt) => process.stdout.write(`${JSON.stringify(receipt)}\n`),
    (error) => {
      process.stderr.write(
        `Completion delivery was not acknowledged: ${error.message}\nKeep the message and retry without repeating the work.\n`,
      );
      process.exitCode = 1;
    },
  );
}
