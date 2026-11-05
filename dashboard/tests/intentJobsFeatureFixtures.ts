// Two published Pygardon-like Gherkin features under one `e2e_test/features`
// location, for journeys that select and read them in Intent's Purpose.

export const featurePath = "e2e_test/features/jobs.feature";
export const otherPath = "e2e_test/features/disk_space.feature";

export const publishedFeature = `Feature: Jobs
  Scenario: List jobs
    Given two jobs
    Then I see two jobs

  Scenario: Cancel a job
    Given a running job
    When I cancel it
    Then it stops

  Scenario Outline: Retry a job after <failure>
    Given a job that failed with <failure>
    Then it is retried <times> times

    Examples:
      | failure | times |
      | timeout | 3     |
      | crash   | 1     |

  Scenario: Archive a job
    Given a finished job
    When I archive it
    Then it leaves the list
`;

export const otherFeature = `Feature: Disk space
  Scenario: Report free space
    Given a disk
    Then I see its free space
`;

export const settings = JSON.stringify(
  {
    intent: {
      locations: [{ path: "e2e_test/features", kind: "gherkin" }],
    },
  },
  null,
  2,
);
