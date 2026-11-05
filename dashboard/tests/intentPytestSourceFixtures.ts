// The published files of a Pygardon-like project for the pytest Proof
// journeys (`./intentPytestProofFixtures.ts`): a `tests` location whose
// top-level file has a parametrized function, an `async def`, a function
// without proof, a `Test*` class method, and text that only looks like
// tests, beside its earlier version with a since-renamed function; a
// `search_run` subfolder; a `frontend/src` typescript spec; and a `shell`
// script for kinds Intent reads no proof for.

export const testsPath = "tests";
export const searchRunPath = `${testsPath}/search_run`;
export const corsPath = `${testsPath}/test_cors.py`;
export const healthPath = `${testsPath}/test_health.py`;
export const searchRunFilePath = `${searchRunPath}/test_search_run.py`;
export const searchFiltersPath = `${searchRunPath}/test_search_filters.py`;
export const frontendSpecPath = "frontend/src/App.test.ts";
export const shellPath = "scripts/check.sh";

export const earlierCors = `"""CORS headers for the API."""

import pytest


def test_allows_listed_origin(client):
    assert client.get("/", headers={"Origin": ALLOWED[0]}).ok


class TestCredentials:
    def test_sends_credentials(self, client):
        assert client.cookies
`;

// Published now: the earlier file with parametrized, async and unproved
// functions added, a function renamed, and text that only looks like tests.
export const corsSource = `"""CORS headers for the API.

def test_inside_docstring():
    an example in prose, not a test
"""

import pytest

ALLOWED = [
    "https://example.org",
]


def test_allows_listed_origin(client):
    assert client.get("/", headers={"Origin": ALLOWED[0]}).ok


@pytest.mark.parametrize(
    "direction",
    ["up", "down", "even"],
    ids=["up", "down", "even"],
)
def test_rounding(direction):
    assert round_to(direction)


async def test_preflight(client):
    assert (await client.options("/")).ok


def test_rejects_unknown_origin(client):
    assert not client.get("/", headers={"Origin": "x"}).ok


class TestCredentials:
    def test_sends_credentials(self, client):
        def test_nested_helper():
            pass

        assert client.cookies

    def helper(self):
        pass


class Helper:
    def test_not_collected(self):
        pass
`;

// `test_rounding`'s definition line in the published file, 1-based.
export const roundingLine = 23;

export const healthSource = `def test_health(client):
    assert client.get("/health").ok
`;

export const searchRunSource = `import pytest


def test_runs_search(index):
    assert index.search("stooq")


@pytest.mark.parametrize("query", ["a", "b"], ids=["a", "b"])
def test_runs_twice(index, query):
    assert index.search(query) == index.search(query)


def test_cancels(index):
    assert index.cancel()
`;

export const searchFiltersSource = `def test_filters(index):
    assert index.filter("x")


async def test_filters_async(index):
    assert await index.filter_async("x")
`;

export const frontendSpec = `import { expect, test } from "vitest";
test("renders", () => {
  expect(1).toBe(1);
});
`;

export const shellSource = "echo ok\n";

export const sources = {
  [corsPath]: corsSource,
  [healthPath]: healthSource,
  [searchRunFilePath]: searchRunSource,
  [searchFiltersPath]: searchFiltersSource,
  [frontendSpecPath]: frontendSpec,
  [shellPath]: shellSource,
};
