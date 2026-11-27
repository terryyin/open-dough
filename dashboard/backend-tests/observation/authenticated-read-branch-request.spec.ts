import { expect, test } from "vitest";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import {
  branchReadRefusals,
  watchedBranchRefusals,
} from "./authenticatedReadRefusalCases.ts";

test.each(branchReadRefusals)(
  "refuses a branch read $read",
  ({ query, error }) => {
    expect(parseRequestedRead(new URLSearchParams(query))).toEqual({
      kind: "refused",
      status: 400,
      message: error,
    });
  },
);

test.each(watchedBranchRefusals)(
  "refuses a watched branch $read",
  ({ query, error }) => {
    expect(parseRequestedRead(new URLSearchParams(query))).toEqual({
      kind: "refused",
      status: 400,
      message: error,
    });
  },
);
