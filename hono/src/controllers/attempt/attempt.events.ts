import { HasResponse } from "../../middleware/mediator/mediator-middleware";
import { handleCatchAttempt } from "./event-handlers/attempt-catch-handler";

// TODO: this obviously should not be here, but with mapping and the deegree api we will deal later
export interface Creature {
  properties: {
    is_shiny: boolean;
    species: string;
  };
}

//#region Catch creature
export interface CatchCreatureResponse {
  creature: Creature;
  inRange: boolean;
}

export interface CatchCreatureQuery extends HasResponse<CatchCreatureResponse> {
  creatureId: string;
  coordinates: [number, number];
}
//#endregion

// Collections to export all events / handlers
export type AttemptEvents = {
  "attempt:catch": CatchCreatureQuery;
};

export const attemptHandlers = {
  "attempt:catch": [handleCatchAttempt],
};
