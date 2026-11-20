// Landing request admission over route, method, origin, host and body text.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  admitLandingRequest,
  landingEndpoint,
  landingPrepareEndpoint,
} from "../../server/launchLandingAdmission.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";

const host = "127.0.0.1:4173";
const origin = `http://${host}`;
const submission = makeMe.aLandingSubmission
  .comparing({
    base: "a1".repeat(20),
    revision: "b2".repeat(20),
  })
  .please();
const bodyText = JSON.stringify(submission);

function refuse(run: () => unknown): { status: number; message: string } {
  try {
    run();
    throw new Error("expected a refusal");
  } catch (error) {
    expect(error).toBeInstanceOf(RefusedRequest);
    const refused = error as RefusedRequest;
    return { status: refused.status, message: refused.message };
  }
}

test("a prepare route admits the operation and submission", () => {
  expect(
    admitLandingRequest({
      route: landingPrepareEndpoint,
      method: "POST",
      origin,
      host,
      bodyText,
    }),
  ).toEqual({ operation: "prepare", submission });
});

test("a record route admits the operation and submission", () => {
  expect(
    admitLandingRequest({
      route: landingEndpoint,
      method: "POST",
      origin,
      host,
      bodyText,
    }),
  ).toEqual({ operation: "record", submission });
});

test("another origin is refused", () => {
  expect(
    refuse(() =>
      admitLandingRequest({
        route: landingPrepareEndpoint,
        method: "POST",
        origin: "http://127.0.0.1:9999",
        host,
        bodyText,
      }),
    ),
  ).toEqual({
    status: 403,
    message: "This endpoint refuses cross-origin requests.",
  });
});

test("another route is refused", () => {
  expect(
    refuse(() =>
      admitLandingRequest({
        route: "/__agent-launch/elsewhere",
        method: "POST",
        origin,
        host,
        bodyText,
      }),
    ),
  ).toEqual({
    status: 404,
    message: "This is not a landing route.",
  });
});

test("a non-POST method is refused", () => {
  expect(
    refuse(() =>
      admitLandingRequest({
        route: landingPrepareEndpoint,
        method: "GET",
        origin,
        host,
        bodyText,
      }),
    ),
  ).toEqual({
    status: 405,
    message: "Only POST is accepted here.",
  });
});

test("a malformed body is refused", () => {
  expect(
    refuse(() =>
      admitLandingRequest({
        route: landingPrepareEndpoint,
        method: "POST",
        origin,
        host,
        bodyText: "{broken",
      }),
    ),
  ).toEqual({
    status: 400,
    message: "The landing request is malformed.",
  });
});
