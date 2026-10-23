// The identity-evidence operation: what the project already shows about the
// identities it has used, so whoever allocates a new one can choose above all
// of it. It reads the active seed directory, the backlog's two lists, and the
// done records and catalog beside the backlog, and reports each source's
// highest seed number with the file or record behind it, the next number
// above every source read, and each source or file it could not read. A
// supplied candidate identity is reported as listed, completed, or unlisted.
//
// It only reads. It reserves, registers, and writes nothing: the caller still
// chooses the identity, and the canonical home records it.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { parseBacklog } from "./product-backlog-document.mjs";
import {
  doneCatalogMismatch,
  doneCatalogPath,
  parseDoneCatalog,
} from "./product-backlog-done-catalog.mjs";
import {
  doneRecordDirectory,
  parseDoneRecordFile,
} from "./product-backlog-done-record.mjs";
import { readDoneRecordFiles } from "./product-backlog-complete.mjs";
import { documentIdIn } from "./product-backlog-home-reader.mjs";
import { BacklogError } from "./product-backlog-refusal.mjs";

// The seed directory a project keeps beside its backlog unless it names
// another with --seeds.
export const defaultSeedDirectory = "seeds";

// A seed ID's number is the digits it ends with ("SEED-084" is 84, written
// three digits wide). An identity is read by its seed ID, before any anchor;
// a plan-path identity ends in no digits and names no seed number.
const seedIdPattern = /^(?<prefix>.*\D)(?<digits>\d+)$/;

function seedNumberOf(identity) {
  const seed = identity.split("#")[0];
  const match = seedIdPattern.exec(seed);
  if (!match) return undefined;
  const { prefix, digits } = match.groups;
  return { seed, prefix, width: digits.length, number: Number(digits) };
}

// The highest seed number among `named`, each { identity, evidence } and,
// across sources, the source naming it; the first named wins a tie.
function highestOf(named) {
  let highest;
  for (const { identity, evidence, source } of named) {
    const seed = seedNumberOf(identity);
    if (seed === undefined) continue;
    if (highest === undefined || seed.number > highest.number)
      highest = { ...seed, identity, evidence, source };
  }
  return highest;
}

const posixPath = (path) => path.split(sep).join("/");

// A source that could not be read at all names nothing and one gap.
const unread = (source, path, reason) => ({
  source,
  path,
  read: false,
  named: [],
  gaps: [{ path, reason }],
});

function seedDirectorySource(backlogDirectory, directory) {
  const path = posixPath(relative(backlogDirectory, directory)) || ".";
  if (!existsSync(directory)) return unread("seed-directory", path, "absent");
  const named = [];
  const gaps = [];
  for (const fileName of readdirSync(directory).sort()) {
    if (!fileName.endsWith(".md")) continue;
    const evidence = `${path}/${fileName}`;
    const id = documentIdIn(readFileSync(join(directory, fileName), "utf8"));
    if (id === "") {
      gaps.push({ path: evidence, reason: "front matter names no seed ID" });
    } else {
      named.push({ identity: id, evidence });
    }
  }
  return { source: "seed-directory", path, read: true, named, gaps };
}

function backlogSource(backlogDirectory, file) {
  const path = posixPath(relative(backlogDirectory, file));
  if (!existsSync(file)) return unread("backlog", path, "absent");
  let document;
  try {
    document = parseBacklog(readFileSync(file, "utf8"));
  } catch (error) {
    if (!(error instanceof BacklogError)) throw error;
    return unread("backlog", path, error.message);
  }
  return {
    source: "backlog",
    path,
    read: true,
    named: document.entries.map(({ identity, list }) => ({
      identity,
      evidence: `${path} "## ${list}"`,
      list,
    })),
    gaps: [],
  };
}

function doneRecordsSource(files) {
  const named = [];
  const gaps = [];
  for (const { fileName, text } of files) {
    const path = `${doneRecordDirectory}/${fileName}`;
    const read = parseDoneRecordFile(fileName, text);
    if (read.ok) {
      named.push({ ...read.record, evidence: path });
    } else {
      gaps.push({ path, reason: read.error });
    }
  }
  return {
    source: "done-records",
    path: doneRecordDirectory,
    read: true,
    named,
    gaps,
  };
}

// The catalog is an index of the record files, so one that is absent while
// records exist, unreadable, or describing other files than those present is
// a gap rather than evidence that nothing else was completed.
function doneCatalogSource(backlogDirectory, files) {
  const path = doneCatalogPath;
  const catalogFile = join(backlogDirectory, doneCatalogPath);
  if (!existsSync(catalogFile)) {
    if (files.length === 0)
      return { source: "done-catalog", path, read: true, named: [], gaps: [] };
    return unread("done-catalog", path, "absent");
  }
  const read = parseDoneCatalog(readFileSync(catalogFile, "utf8"));
  if (!read.ok) return unread("done-catalog", path, read.error);
  const mismatch = doneCatalogMismatch(read.catalog, files);
  return {
    source: "done-catalog",
    path,
    read: true,
    named: read.catalog.records.map(({ identity, fileName }) => ({
      identity,
      evidence: `${doneRecordDirectory}/${fileName}`,
    })),
    gaps: mismatch === undefined ? [] : [{ path, reason: mismatch }],
  };
}

function candidateStatus(identity, backlog, records) {
  const listed = backlog.named.find((entry) => entry.identity === identity);
  const record = records.named.find((each) => each.identity === identity);
  const completed =
    record === undefined
      ? {}
      : {
          completed: {
            record: record.evidence,
            title: record.title,
            completedAt: record.completedAt,
          },
        };
  if (listed !== undefined)
    return { identity, status: "active", list: listed.list, ...completed };
  if (record !== undefined)
    return { identity, status: "completed", ...completed };
  return { identity, status: "unlisted" };
}

function reportedHighest(highest) {
  if (highest === undefined) return null;
  const { seed, number, identity, evidence } = highest;
  return { seed, number, identity, evidence };
}

/**
 * The allocation evidence beside the backlog at `file`, with the seed
 * directory at `seedDirectory` (default: "seeds" beside the backlog) and the
 * status of `identity` when one is supplied.
 */
export function readIdentityEvidence(file, { seedDirectory, identity }) {
  const backlogDirectory = dirname(file);
  const doneFiles = readDoneRecordFiles(backlogDirectory);
  const backlog = backlogSource(backlogDirectory, file);
  const records = doneRecordsSource(doneFiles);
  const sources = [
    seedDirectorySource(
      backlogDirectory,
      seedDirectory ?? join(backlogDirectory, defaultSeedDirectory),
    ),
    backlog,
    records,
    doneCatalogSource(backlogDirectory, doneFiles),
  ];
  const overall = highestOf(
    sources.flatMap(({ source, named }) =>
      named.map((entry) => ({ ...entry, source })),
    ),
  );
  return {
    highest:
      overall === undefined
        ? null
        : { source: overall.source, ...reportedHighest(overall) },
    next:
      overall === undefined
        ? null
        : `${overall.prefix}${String(overall.number + 1).padStart(overall.width, "0")}`,
    sources: sources.map(({ source, path, read, named }) => ({
      source,
      path,
      read,
      highest: reportedHighest(highestOf(named)),
    })),
    gaps: sources.flatMap(({ source, gaps }) =>
      gaps.map((gap) => ({ source, ...gap })),
    ),
    ...(identity === undefined
      ? {}
      : { candidate: candidateStatus(identity, backlog, records) }),
  };
}
