// A dated series for the shared CI wall-time and scope execution-time chart.
export type HistoryChartPoint = {
  readonly key: string;
  readonly date: string;
  readonly ms: number;
  readonly description: string;
  readonly segment?: string;
  readonly selected?: boolean;
};

export type HistoryChartSeries = {
  readonly label: string;
  readonly points: readonly HistoryChartPoint[];
  // Includes gaps so the date range does not silently end at the last point.
  readonly dates?: readonly string[];
  readonly precise?: boolean;
  readonly annotations?: readonly {
    readonly key: string;
    readonly date: string;
    readonly label: string;
  }[];
};
