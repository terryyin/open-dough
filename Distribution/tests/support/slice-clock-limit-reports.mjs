// What a clock command says about a slice's limit.
export function limitReport({ result }) {
  const { slice, elapsedMinutes, remainingMinutes } = result;
  const { overrun, storyOverruns, message } = result;
  return {
    slice,
    elapsedMinutes,
    remainingMinutes,
    overrun,
    storyOverruns,
    message,
  };
}

// The limit reports expected of the slices of the story `identity`.
export function limitReportsOf(identity) {
  return {
    withinLimit: (slice, elapsedMinutes, storyOverruns) => ({
      slice,
      elapsedMinutes,
      remainingMinutes: 15 - elapsedMinutes,
      overrun: false,
      storyOverruns,
      message: undefined,
    }),
    overrun: (slice, elapsedMinutes, storyOverruns) => ({
      slice,
      elapsedMinutes,
      remainingMinutes: 0,
      overrun: true,
      storyOverruns,
      message: `slice ${slice} of ${identity} reached the 15-minute limit: ${elapsedMinutes} active minutes`,
    }),
  };
}
