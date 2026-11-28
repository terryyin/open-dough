// The shared publisher admission and live landing route use the same local request rules.
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  admitLandingRequest,
  landingEndpoint,
  landingPrepareEndpoint,
  parseLandingSubmission,
} from "../../server/launchLandingAdmission.ts";
import { submitLanding } from "../../server/launchLandingReporting.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";

const host = "127.0.0.1:4173";
const origin = `http://${host}`;
const submission = makeMe.aLandingSubmission
  .comparing({
    base: "a1".repeat(20),
    revision: "b2".repeat(20),
  })
  .please();
const prepare = {
  route: landingPrepareEndpoint,
  method: "POST",
  origin,
  host,
  bodyText: JSON.stringify(submission),
};

test("a same-origin prepare without an Origin header is admitted", () => {
  const request = { ...prepare, origin: undefined, fetchSite: "same-origin" };

  expect(admitLandingRequest(request)).toEqual({
    operation: "prepare",
    submission,
  });
});

test("a record route with a matching Origin is admitted", () => {
  expect(admitLandingRequest({ ...prepare, route: landingEndpoint })).toEqual({
    operation: "record",
    submission,
  });
});

function nonJsonRequest(route: string, method: string): IncomingMessage {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const request = new IncomingMessage(socket);
  request.url = route;
  request.method = method;
  request.headers = { host, origin, "content-type": "text/plain" };
  return request;
}

test.each([
  {
    name: "another origin",
    run: () =>
      admitLandingRequest({ ...prepare, origin: "http://127.0.0.1:9999" }),
    status: 403,
    message: "This endpoint refuses cross-origin requests.",
  },
  {
    name: "a non-loopback Host even with same-origin metadata",
    run: () =>
      admitLandingRequest({
        ...prepare,
        host: "example.test",
        origin: undefined,
        fetchSite: "same-origin",
      }),
    status: 403,
    message: "This endpoint only answers on the local loopback host.",
  },
  {
    name: "another route",
    run: () =>
      admitLandingRequest({ ...prepare, route: "/__agent-launch/elsewhere" }),
    status: 404,
    message: "This is not a landing route.",
  },
  {
    name: "a non-POST method",
    run: () => admitLandingRequest({ ...prepare, method: "GET" }),
    status: 405,
    message: "Only POST is accepted here.",
  },
  {
    name: "malformed JSON",
    run: () => admitLandingRequest({ ...prepare, bodyText: "{broken" }),
    status: 400,
    message: "The landing request is malformed.",
  },
  {
    name: "a caller-selected repository",
    run: () =>
      parseLandingSubmission(
        JSON.stringify({ ...submission, repository: "/caller-selected" }),
      ),
    status: 400,
    message: "The landing request is malformed.",
  },
  {
    name: "a non-JSON GET before checking its body",
    run: () => submitLanding(nonJsonRequest(landingPrepareEndpoint, "GET")),
    status: 405,
    message: "Only POST is accepted here.",
  },
  {
    name: "an unknown route before checking its body",
    run: () =>
      submitLanding(nonJsonRequest("/__agent-launch/elsewhere", "POST")),
    status: 404,
    message: "This is not a landing route.",
  },
  {
    name: "a non-JSON POST on a landing route",
    run: () => submitLanding(nonJsonRequest(landingPrepareEndpoint, "POST")),
    status: 415,
    message: "A request here is JSON.",
  },
])("refuses $name", async ({ run, status, message }) => {
  const refused = Promise.resolve().then<unknown>(run);

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status, message });
});
