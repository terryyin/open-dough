// Decisive excerpts copied locally; tests never load the source repositories.
// ODF-156: pygardon f93f2014b,
// .planning/seeds/SEED-078-maintained-sharadar-daily-source.md
// #story-sharadar-daily-update, and plan 296-sharadar-daily-update's slice 6
// accepted proof: "other exceptions propagate leaving `running` (slice 8)."
export const liveFault = {
  story:
    "A failure preserves previous usable versions and ends that\nrun; the owner may use the on-demand action to recover, and the next daily\noccurrence can try normally. Recovery does not erase the scheduled failure.",
  clause:
    "A failure preserves previous usable versions and ends that run; the owner may use the on-demand action to recover, and the next daily occurrence can try normally.",
  reported: "other exceptions propagate leaving `running` (slice 8).",
  reportedSlice: 6,
};

// ODF-185: doughnut 0662bac730, .planning/seeds/SEED-066-voice-input.md
// #understandable-first-dictation, and plan
// 008-complete-a-first-dictation-with-understandable-controls's Learnings.
// The reported text is the recorded interim, not a fabricated exclusion.
export const recordDuringStop = {
  story:
    "After Stop, the status says the text was\nadded to the note only when a passage from this recording was written and\nits save succeeded. When nothing was written, it says that no speech was\nturned into text and does not claim an addition.",
  clause:
    "After Stop, the status says the text was added to the note only when a passage from this recording was written and its save succeeded.",
  reported:
    "While Stop is finishing, the main action already shows Record again.",
  reportedSlice: 1,
};

export const dailySlices = { indices: [1, 2, 3, 4, 5, 6, 7, 8] };
