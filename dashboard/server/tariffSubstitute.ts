// The model whose rates stand in for a named model a tariff does not list
// (./tokenIndex.ts). A model id reads as a family around one version of
// integer components: `gpt-6.2-astra` is the `gpt-…-astra` family at major 6,
// minor 2, `claude-fable-5-2` the `claude-fable-…` family at 5, 2, and a
// missing minor is 0 (`gpt-6-astra` is 6, 0). The listed member of the same
// family with the smallest major difference, then the smallest minor
// difference, stands in when it is the only one; a tie, an unfamiliar family
// or an unclear version (none, or more than two parts) falls back to the
// tariff's reference model.
import type { UsageTariff } from "./usageTariffs.ts";

type Versioned = {
  readonly family: string;
  readonly major: number;
  readonly minor: number;
};

function versioned(model: string): Versioned | undefined {
  const match = /^(\D*?)(\d+(?:[.-]\d+)*)(\D*)$/.exec(model);
  if (match === null) return undefined;
  const [, prefix = "", digits = "", suffix = ""] = match;
  const [major = "", minor = "0", ...rest] = digits.split(/[.-]/);
  if (rest.length > 0) return undefined;
  return {
    family: `${prefix}…${suffix}`,
    major: Number(major),
    minor: Number(minor),
  };
}

export function substituteModel(model: string, tariff: UsageTariff): string {
  const reference = tariff.reference.model;
  const unlisted = versioned(model);
  if (unlisted === undefined) return reference;
  const [closest, runnerUp] = Object.keys(tariff.models)
    .flatMap((listed) => {
      const candidate = versioned(listed);
      if (candidate?.family !== unlisted.family) return [];
      const major = Math.abs(candidate.major - unlisted.major);
      const minor = Math.abs(candidate.minor - unlisted.minor);
      return [{ listed, major, minor }];
    })
    .toSorted((a, b) => a.major - b.major || a.minor - b.minor);
  if (closest === undefined) return reference;
  const tied =
    runnerUp?.major === closest.major && runnerUp.minor === closest.minor;
  return tied ? reference : closest.listed;
}
