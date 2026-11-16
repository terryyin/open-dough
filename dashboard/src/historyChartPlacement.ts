// Horizontal placement of one history chart series (`./historyChartSeries.ts`)
// and its axis words. Over time by default: each entry and trend point at its
// date. In order (`HistoryChartSeries.order`): each entry in its own
// equal-width slot in entry order, and each trend point at the slot of the
// entry it is anchored on (`key`), its date unchanged for readouts; an
// ordered series anchors every trend point on one of its entries.
import { buildDateWords } from "./ciHistoryWords.ts";
import type { HistoryChartSeries } from "./historyChartSeries.ts";

// What is placed: an entry, or a trend point with its anchor entry's key.
export type Placeable = { readonly date: string; readonly key?: string };

export type Placement = {
  readonly x: (at: Placeable) => number;
  readonly axis: (
    marks: readonly { readonly x: number; readonly date: string }[],
    width: number,
  ) => { readonly x: number; readonly words: string }[];
};

const dateRoom = 64;
const dateEdgeRoom = 22;

function overTime(
  series: HistoryChartSeries,
  left: number,
  end: number,
): Placement {
  const dates = series.entries.map((entry) => Date.parse(entry.date));
  const earliest = Math.min(...dates);
  const latest = Math.max(...dates);
  return {
    x: ({ date }) =>
      latest === earliest
        ? (left + end) / 2
        : left +
          ((Date.parse(date) - earliest) / (latest - earliest)) * (end - left),
    axis: (marks, width) => {
      const dated: { x: number; words: string }[] = [];
      const middle =
        marks.length >= 3 && width >= 480 ? [Math.floor(marks.length / 2)] : [];
      for (const index of [0, ...middle, marks.length - 1]) {
        const mark = marks[index];
        if (mark === undefined) continue;
        const words = buildDateWords(mark.date);
        const under = Math.min(mark.x, width - dateEdgeRoom);
        if (
          dated.some(
            (each) =>
              each.words === words || Math.abs(each.x - under) < dateRoom,
          )
        )
          continue;
        dated.push({ x: under, words });
      }
      return dated;
    },
  };
}

function inOrder(
  series: HistoryChartSeries,
  words: string,
  left: number,
  end: number,
): Placement {
  const slots = new Map(series.entries.map(({ key }, slot) => [key, slot]));
  const width = (end - left) / Math.max(1, series.entries.length);
  return {
    x: ({ key, date }) => {
      const slot = key === undefined ? undefined : slots.get(key);
      if (slot === undefined)
        throw new Error(`No entry anchors the point at ${date}`);
      return left + (slot + 0.5) * width;
    },
    axis: () => [{ x: (left + end) / 2, words }],
  };
}

export const placement = (
  series: HistoryChartSeries,
  left: number,
  end: number,
): Placement =>
  series.order === undefined
    ? overTime(series, left, end)
    : inOrder(series, series.order.axisWords, left, end);
