// One selection/filter rule for any complete comparable measure projected
// from the retained landing snapshot. Ordering is local Git evidence, never
// dates. Wall-time and scope owners supply their own completeness reading.
import { z } from "zod";
import { timeChangeOf } from "./storyCiRelativeChange.ts";
import { executionTimeDifferenceWords } from "./ciProofTimeWords.ts";

const instantSchema = z.iso.datetime({ offset: true });
const measurement = {
  key: z.string(),
  date: instantSchema,
  ms: z.number().nonnegative().optional(),
  reason: z.string().optional(),
};
const evidenceSchema = z.object({
  ...measurement,
  status: z.enum(["included", "excluded", "selected"]),
});
export const priorBuildReferenceSchema = z.object({
  endpoint: z.string(),
  selected: z.object(measurement).optional(),
  evidence: z.array(evidenceSchema),
  sampleCount: z.number().int().nonnegative(),
  medianMs: z.number().nonnegative().optional(),
  averageMs: z.number().nonnegative().optional(),
  from: instantSchema.optional(),
  to: instantSchema.optional(),
  difference: z
    .object({
      text: z.string(),
      changeMs: z.number(),
      relative: z.number().optional(),
    })
    .optional(),
});
export type PriorBuildReference = z.infer<typeof priorBuildReferenceSchema>;
export type PriorBuildEvidence = PriorBuildReference["evidence"][number];
export type PriorBuildSample = z.infer<z.ZodObject<typeof measurement>> & {
  readonly revision?: string;
  readonly landings: readonly string[];
};

function isIncludedMeasurement(
  sample: PriorBuildEvidence,
): sample is PriorBuildEvidence & { readonly ms: number } {
  return sample.status === "included" && sample.ms !== undefined;
}

export function priorBuildReferenceOf({
  endpoint,
  order,
  selectedKey,
  samples,
}: {
  readonly endpoint: string;
  readonly order: readonly string[] | undefined;
  readonly selectedKey?: string;
  readonly samples: readonly PriorBuildSample[];
}): PriorBuildReference {
  const positions = new Map(order?.map((revision, index) => [revision, index]));
  const end = positions.get(endpoint);
  const byAttempt = new Map<string, PriorBuildSample>();
  for (const sample of samples) {
    const previous = byAttempt.get(sample.key);
    byAttempt.set(sample.key, {
      ...sample,
      landings: [
        ...new Set([...(previous?.landings ?? []), ...sample.landings]),
      ],
    });
  }
  const position = (sample: PriorBuildSample) =>
    Math.min(
      ...sample.landings.map((revision) => positions.get(revision) ?? Infinity),
    );
  const distinct = [...byAttempt.values()].sort(
    (a, b) => position(a) - position(b),
  );
  const selected = distinct.find((sample) => sample.key === selectedKey);
  const selectedMs = selected?.reason === undefined ? selected?.ms : undefined;
  const evidence = distinct.map((sample): PriorBuildEvidence => {
    const { key, date, ms, reason } = sample;
    const reading = { key, date, ...(ms === undefined ? {} : { ms }) };
    if (key === selectedKey)
      return {
        ...reading,
        status: "selected",
        ...(reason === undefined ? {} : { reason }),
      };
    const priorLanding = sample.landings.some(
      (revision) =>
        end !== undefined && (positions.get(revision) ?? Infinity) < end,
    );
    const measured =
      sample.revision === undefined
        ? undefined
        : positions.get(sample.revision);
    const exclusion =
      end === undefined
        ? "Landing endpoint order unavailable from local Git evidence"
        : !priorLanding
          ? "No represented landing before the selected endpoint"
          : sample.revision !== undefined && measured === undefined
            ? "Measured revision order unavailable from local Git evidence"
            : measured !== undefined && measured >= end
              ? "Measured build is at or after the selected endpoint"
              : (reason ??
                (ms === undefined ? "Measurement unavailable" : undefined));
    return exclusion === undefined
      ? { ...reading, status: "included" }
      : { ...reading, status: "excluded", reason: exclusion };
  });
  // Retention owns the bounded cohort. The extra cap never replaces excluded
  // samples with older observations or asks a provider for more evidence.
  const comparable = evidence.filter(isIncludedMeasurement);
  for (const sample of comparable.slice(
    0,
    Math.max(0, comparable.length - 20),
  )) {
    sample.status = "excluded";
    sample.reason = "Outside the twenty prior-build comparison window";
  }
  const values = evidence
    .filter(isIncludedMeasurement)
    .map((sample) => sample.ms)
    .sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  const upper = values[middle];
  const lower = values[middle - 1];
  const medianMs =
    upper === undefined
      ? undefined
      : values.length % 2 === 1
        ? upper
        : lower === undefined
          ? undefined
          : (lower + upper) / 2;
  for (const sample of evidence) {
    // Multiplication by 100/115 avoids rounding an equality just above the
    // binary representation of median * 1.15. No display rounding participates.
    if (
      isIncludedMeasurement(sample) &&
      medianMs !== undefined &&
      sample.ms * 100 > medianMs * 115
    ) {
      sample.status = "excluded";
      sample.reason = "Slow outlier: more than 15% above the median";
    }
  }
  const included = evidence.filter(isIncludedMeasurement);
  const dates = included
    .map((sample) => sample.date)
    .sort((a, b) => Date.parse(a) - Date.parse(b));
  const averageMs =
    included.length < 5
      ? undefined
      : included.reduce((sum, sample) => sum + sample.ms, 0) / included.length;
  return {
    endpoint,
    ...(selected === undefined
      ? {}
      : {
          selected: {
            key: selected.key,
            date: selected.date,
            ...(selectedMs === undefined ? {} : { ms: selectedMs }),
            ...(selected.reason === undefined
              ? {}
              : { reason: selected.reason }),
          },
        }),
    evidence,
    sampleCount: included.length,
    ...(medianMs === undefined ? {} : { medianMs }),
    ...(dates.length === 0 ? {} : { from: dates[0], to: dates.at(-1) }),
    ...(averageMs === undefined ? {} : { averageMs }),
    ...(averageMs === undefined || selectedMs === undefined
      ? {}
      : {
          difference: timeChangeOf(
            averageMs,
            selectedMs,
            executionTimeDifferenceWords,
          ),
        }),
  };
}
