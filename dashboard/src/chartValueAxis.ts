// How the dated history chart (`./historyChartLayout.ts`) reads a series'
// values: the ticks of its value axis for the values it draws, a value's
// words in a readout, and, when shorter, its words on an axis tick. CI timing
// reads durations (`./ciDurationAxis.ts`); Usage reads a Token index count.

export type ValueAxis = {
  readonly ticks: (values: readonly number[]) => readonly number[];
  readonly words: (value: number) => string;
  readonly tickWords?: (value: number) => string;
};

// The smallest step of 1, 2 or 5 times a power of ten that ticks `low` to
// `high` in at most four steps.
export function niceStep(low: number, high: number): number {
  const scale = Math.pow(
    10,
    Math.floor(Math.log10(Math.max(1, high - low) / 4)),
  );
  return (
    [1, 2, 5, 10]
      .map((factor) => factor * scale)
      .find(
        (candidate) =>
          Math.ceil(high / candidate) - Math.floor(low / candidate) <= 4,
      ) ?? scale * 10
  );
}

// Every multiple of `step` from below `low` to above `high`.
export function ticksBetween(
  low: number,
  high: number,
  step: number,
): number[] {
  const ticks: number[] = [];
  for (
    let at = Math.floor(low / step) * step;
    at <= Math.ceil(high / step) * step;
    at += step
  )
    ticks.push(at);
  return ticks;
}

// A count read from zero: "12,345" in a readout, "12K" on a tick.
const exact = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
export const countWords = (value: number): string => exact.format(value);

export const countAxis: ValueAxis = {
  ticks: (values) => {
    const high = Math.max(1, ...values);
    return ticksBetween(0, high, niceStep(0, high));
  },
  words: countWords,
  tickWords: (value) => compact.format(value),
};
