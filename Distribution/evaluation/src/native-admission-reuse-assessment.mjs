// Disposable artifact materialization and current candidate reassessment.
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { readStreamFile } from "./native-host-stream.mjs";
import { readRetainedAttempt } from "./native-stream-retained-attempt.mjs";
import { runEvidenceCommand } from "./native-admission-reuse-identity.mjs";

function within(root, file) {
  const path = resolve(root, file);
  const rel = relative(root, path);
  if (!file || isAbsolute(file) || rel === ".." || rel.startsWith("../"))
    throw new Error(`artifact leaves retained attempt: ${file}`);
  return path;
}

const assessmentScript = `
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
const [candidate, stream, host] = process.argv.slice(2);
const fieldsModule = await import(pathToFileURL(join(candidate, 'Distribution/tests/support/git-publication-native-stream-fields.mjs')));
const replay = await import(pathToFileURL(join(candidate, 'Distribution/tests/support/native-stream-publication-replay.mjs')));
const fields = new Map(fieldsModule.publicationStreamFields('admission-investigation', host, stream).map(([key,value]) => [key,String(value)]));
const verdict = replay.reassessVerdicts([replay.replayedAttempt(stream, fields)])[0];
process.stdout.write(JSON.stringify({verdict, streamFields:Object.fromEntries(fields)}));
`;

export function assessRetainedAdmission({
  candidate,
  attempt,
  host,
  artifacts,
  gaps: previousGaps,
}) {
  const gaps = [...previousGaps];
  const reassessment = {
    artifacts: [],
    assessment: { status: "unavailable" },
    gaps,
  };
  const scratch = mkdtempSync(join(tmpdir(), "admission-reuse."));
  try {
    cpSync(join(attempt, "record"), join(scratch, "record"));
    for (const file of ["observations.txt", "response.md"])
      if (existsSync(join(attempt, file)))
        cpSync(join(attempt, file), join(scratch, file));
    for (const { key, file } of artifacts) {
      try {
        const path = within(attempt, file);
        const compressed =
          !existsSync(path) && existsSync(`${path}.gz`) && /-events$/.test(key);
        const actual = compressed ? `${path}.gz` : path;
        const present = existsSync(actual);
        reassessment.artifacts.push({
          key,
          file,
          present,
          source: actual,
          materializedFromGzip: compressed,
        });
        if (!present) {
          gaps.push(`artifact ${key} is missing: ${file}`);
          continue;
        }
        const destination = within(scratch, file);
        mkdirSync(dirname(destination), { recursive: true });
        if (/-events$/.test(key))
          writeFileSync(destination, readStreamFile(actual));
        else cpSync(actual, destination);
      } catch (error) {
        gaps.push(`artifact ${key} unreadable: ${error.message}`);
      }
    }
    const fresh = readRetainedAttempt(scratch);
    reassessment.streams = fresh.phases.map(({ phase, file, read }) => ({
      phase,
      file,
      status: read.status,
    }));
    if (
      fresh.family !== "publication" ||
      fresh.journey !== "admission-investigation" ||
      fresh.phases.length !== 1
    )
      throw new Error("assessment requires one admission-investigation stream");
    const assessed = JSON.parse(
      runEvidenceCommand(
        process.execPath,
        [
          "--input-type=module",
          "-",
          candidate,
          join(scratch, fresh.phases[0].file),
          host,
        ],
        { input: assessmentScript, cwd: candidate },
      ),
    );
    reassessment.assessment = {
      status: assessed.verdict.startsWith("pass / ")
        ? "pass"
        : assessed.verdict.startsWith("fail / ")
          ? "fail"
          : "unavailable",
      ...assessed,
      provenance:
        "candidate publication stream fields and reassessVerdicts on disposable retained artifacts",
    };
    if (reassessment.assessment.status !== "pass")
      gaps.push(`current assessment: ${assessed.verdict}`);
  } catch (error) {
    gaps.push(`current assessment unavailable: ${error.message}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  return reassessment;
}
