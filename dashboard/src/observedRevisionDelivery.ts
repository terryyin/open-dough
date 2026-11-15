// Bind observation reactions to the existing delivery owners. Confirmation
// changes never become scheduling dependencies.
import {
  useRevisionCheckSchedule,
  type RevisionDeliveryAnswers,
} from "./revisionCheckSchedule.ts";
import { useRevisionStreamSchedule } from "./revisionStreamSchedule.ts";
import { useDashboardConnection } from "./dashboardConnection.ts";
import { useRevisionDelivery } from "./revisionStreamSlot.ts";

type ObservationAnswers = Omit<
  RevisionDeliveryAnswers,
  "delivery" | "onReceived" | "onDeliveryLost"
>;
export function useObservedRevisionDelivery(answers: ObservationAnswers) {
  const { connection, received, lost } = useDashboardConnection(answers.source);
  const delivery = useRevisionDelivery(answers.visibility !== "hidden");
  const revisionAnswers = {
    ...answers,
    delivery,
    onReceived: received,
    onDeliveryLost: lost,
  };
  useRevisionCheckSchedule(revisionAnswers);
  useRevisionStreamSchedule(revisionAnswers);
  return answers.source !== undefined ? connection : undefined;
}
