// Waits in this checkout until a remote publishes a change to a watched ref,
// or to a path on one named REF:PATH, or until the deadline. It prints
// nothing while the watched objects are unchanged and exactly one JSON result
// line when the wait ends.
import { setTimeout as delay } from "node:timers/promises";
import { parseArgs } from "node:util";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import { git } from "./publication-git.mjs";

const usage =
  "Usage: node wait-for-publication.mjs --remote REMOTE --ref REF[:PATH] [--ref REF[:PATH]]... [--duration-minutes MINUTES | --deadline ISO_TIME] [--interval-seconds SECONDS]";
const flags = [
  "remote",
  "ref",
  "duration-minutes",
  "deadline",
  "interval-seconds",
];
const defaultDurationMinutes = 60;
const defaultIntervalSeconds = 60;

function positive(text, flag) {
  const value = Number(text);
  if (!(Number.isFinite(value) && value > 0))
    throw new Error(`${flag} needs a positive number, not ${text}`);
  return value;
}

// REF watches the ref's own object; REF:PATH watches that path on the ref.
function watchedItem(named) {
  const colon = named.indexOf(":");
  return colon < 0
    ? { ref: named }
    : { ref: named.slice(0, colon), path: named.slice(colon + 1) };
}

// The wait the arguments describe, with its deadline as a time.
function waitRequest(argv) {
  const { values } = parseArgs({
    args: argv,
    options: Object.fromEntries(
      flags.map((flag) => [flag, { type: "string", multiple: true }]),
    ),
  });
  const once = (flag) => {
    if (values[flag]?.length > 1) throw new Error(`name --${flag} once`);
    return values[flag]?.[0];
  };
  const remote = once("remote");
  if (remote === undefined || values.ref === undefined)
    throw new Error("name one --remote and at least one --ref");
  const duration = once("duration-minutes");
  const deadline = once("deadline");
  if (duration !== undefined && deadline !== undefined)
    throw new Error("name --duration-minutes or --deadline, not both");
  const deadlineMs =
    deadline === undefined
      ? Date.now() +
        positive(duration ?? defaultDurationMinutes, "--duration-minutes") *
          60_000
      : Date.parse(deadline);
  if (Number.isNaN(deadlineMs))
    throw new Error(`--deadline needs an ISO time, not ${deadline}`);
  return {
    remote,
    watched: values.ref.map(watchedItem),
    deadlineMs,
    intervalMs:
      positive(
        once("interval-seconds") ?? defaultIntervalSeconds,
        "--interval-seconds",
      ) * 1000,
  };
}

// The object the fetched ref holds at `path`, or the ref's own object; null
// for a path the ref does not hold.
async function fetchedObject(checkout, path) {
  const name = path === undefined ? "FETCH_HEAD" : `FETCH_HEAD:${path}`;
  try {
    const found = await git(checkout, "rev-parse", "--verify", "--quiet", name);
    return found.stdout.trim();
  } catch (error) {
    if (error.code === 1 && path !== undefined) return null;
    throw error;
  }
}

// Every watched object as the remote holds it now, fetching each ref once per
// run of items that name it.
async function observe(checkout, { remote, watched }) {
  const observed = [];
  let fetched;
  for (const item of watched) {
    if (item.ref !== fetched) {
      try {
        await git(checkout, "fetch", "--quiet", remote, item.ref);
      } catch (error) {
        const reason = (error.stderr || error.message).trim();
        throw new Error(`cannot read ${item.ref} from ${remote}: ${reason}`, {
          cause: error,
        });
      }
      fetched = item.ref;
    }
    observed.push({
      ...item,
      object: await fetchedObject(checkout, item.path),
    });
  }
  return observed;
}

function changesBetween(before, after) {
  return after.flatMap(({ object, ...watched }, index) =>
    object === before[index].object
      ? []
      : [{ ...watched, before: before[index].object, after: object }],
  );
}

// Resolves with the one result of the wait. A first observation that fails
// rejects; a later one is tried again at the next interval.
async function waitForPublication(checkout, request) {
  const { remote, deadlineMs, intervalMs } = request;
  const deadline = new Date(deadlineMs).toISOString();
  const start = await observe(checkout, request);
  for (;;) {
    const remaining = deadlineMs - Date.now();
    if (remaining <= 0) return { result: "deadline", remote, deadline };
    await delay(Math.min(intervalMs, remaining));
    const changes = await observe(checkout, request).then(
      (now) => changesBetween(start, now),
      () => [],
    );
    if (changes.length > 0)
      return { result: "publication", remote, changes, deadline };
  }
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  let request;
  try {
    request = waitRequest(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n${usage}\n`);
    process.exit(2);
  }
  try {
    const result = await waitForPublication(process.cwd(), request);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
