import { HasResponse } from "../../middleware/mediator/mediator-middleware";
import { handleCatchAttempt } from "./event-handlers/attempt-catch-handler";
import { Position } from "geojson";

//#region Catch creature
export interface CatchCreatureResponse {
  species?: string; // Only set if inRange is true
  isShiny?: boolean; // Only set if inRange is true
  inRange: boolean;
}

export interface CatchCreatureQuery extends HasResponse<CatchCreatureResponse> {
  creatureId: string;
  coordinates: Position;
}
//#endregion

// Collections to export all events / handlers
export type AttemptEvents = {
  "attempt:catch": CatchCreatureQuery;
};

export const attemptHandlers = {
  "attempt:catch": [handleCatchAttempt],
};
