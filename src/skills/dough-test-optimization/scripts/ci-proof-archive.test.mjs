// The one file of a small zip archive (./ci-proof-archive.mjs): inflated and
// checked within the caller's read limit, or a problem that says why. The
// summary read that names its file and limit: ./ci-proof-read.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { zipOf } from "../../../../dashboard/tests/support/ciProofArtifacts.ts";
import {
  onlyZipEntry,
  ZipEntryProblem,
  ZipEntryTooLarge,
} from "./ci-proof-archive.mjs";

const name = "ci-proof-summary.json";
const text = '{"schemaVersion":1}\n';
const archive = zipOf(name, text);
const limitBytes = 1024;

// The problem reading BYTES as an archive of NAME within the limit.
function problemOf(bytes) {
  try {
    onlyZipEntry(bytes, name, limitBytes);
  } catch (error) {
    assert.ok(error instanceof ZipEntryProblem, String(error));
    return error;
  }
  return assert.fail("the archive was read");
}

test("the archive's only file is inflated and checked against its recorded size and checksum", () => {
  assert.equal(onlyZipEntry(archive, name, limitBytes), text);
});

test("a file beyond the read limit is too large as recorded, and one that understates its size is not inflated past the limit", () => {
  const large = zipOf(name, "x".repeat(limitBytes + 1));
  const tooLarge = problemOf(large);
  assert.ok(tooLarge instanceof ZipEntryTooLarge);
  assert.equal(tooLarge.sizeBytes, limitBytes + 1);

  const central = large.readUInt32LE(large.length - 22 + 16);
  large.writeUInt32LE(limitBytes, central + 24);
  assert.equal(problemOf(large).message, `${name} could not be inflated`);
});

test("an archive that is not one intact file of that name is a problem that says why", () => {
  const end = archive.length - 22;
  const central = archive.readUInt32LE(end + 16);
  const data = 30 + name.length;
  // ARCHIVE as CHANGE rewrites a copy of it.
  const changed = (change) => {
    const copy = Buffer.from(archive);
    change(copy);
    return copy;
  };
  for (const [bytes, problem] of [
    [Buffer.from("not a zip"), "the archive is not a zip archive"],
    [
      archive.subarray(0, archive.length - 30),
      "the archive has no zip central directory",
    ],
    [
      changed((copy) => copy.writeUInt16LE(2, end + 10)),
      "the archive does not hold exactly one file",
    ],
    [
      changed((copy) => copy.writeUInt32LE(archive.length, end + 16)),
      "the archive is truncated",
    ],
    [
      changed((copy) => copy.writeUInt32LE(0, central)),
      "the archive's central directory is unreadable",
    ],
    [
      changed((copy) => copy.writeUInt16LE(0xffff, central + 28)),
      "the archive is truncated",
    ],
    [
      zipOf("other.json", "{}"),
      "the archive holds other.json, not ci-proof-summary.json",
    ],
    [
      changed((copy) => copy.writeUInt16LE(1, central + 8)),
      "the archive's file is encrypted",
    ],
    [
      changed((copy) => copy.writeUInt32LE(archive.length, central + 42)),
      "the archive is truncated",
    ],
    [
      changed((copy) => copy.writeUInt32LE(0, 0)),
      "the archive's file header is unreadable",
    ],
    [
      changed((copy) => copy.writeUInt32LE(archive.length, central + 20)),
      "the archive is truncated",
    ],
    [
      changed((copy) => copy.writeUInt16LE(12, central + 10)),
      "ci-proof-summary.json uses zip method 12",
    ],
    [
      changed((copy) => copy.writeUInt8(0xff, data)),
      "ci-proof-summary.json could not be inflated",
    ],
    [
      changed((copy) =>
        copy.writeUInt32LE(copy.readUInt32LE(central + 24) + 1, central + 24),
      ),
      "ci-proof-summary.json does not match its recorded checksum",
    ],
    [
      changed((copy) =>
        copy.writeUInt32LE(
          (copy.readUInt32LE(central + 16) ^ 1) >>> 0,
          central + 16,
        ),
      ),
      "ci-proof-summary.json does not match its recorded checksum",
    ],
  ])
    assert.equal(problemOf(bytes).message, problem, problem);
});
