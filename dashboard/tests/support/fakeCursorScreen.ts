// Screens a fake Cursor attach can paint, and the text an unclassified
// exit prints. Working mode paints `ctrl+c to stop`. The default attach
// screen is the ordinary finished prompt. Waiting mode paints the native
// clarifying-question screen (a `Question N of M` line, numbered question
// lines, and the `Space select · Enter next/submit` footer). Trust mode
// paints a screen that is not ready for an instruction.
// Cancelled-follow-up mode paints cancelled/failed history above the
// ordinary follow-up prompt. Composer mode paints
// `→ Plan, search, build anything` with the cursor hidden and no
// synchronized-update frame. Unrecognized mode paints neither the prompt
// nor a question. Trust-unframed models the native trust screen without a
// synchronized frame or output from the join's resize nudge. Other modes
// redraw on SIGWINCH.

export type CursorScreen =
  | "working"
  | "follow-up"
  | "cancelled-follow-up"
  | "waiting"
  | "unrecognized"
  | "trust"
  | "trust-unframed"
  | "composer"
  | "exit"
  | "cannot-load";

export const unclassifiedCursorExit =
  "Cursor resume failed for an unclassified reason.";
