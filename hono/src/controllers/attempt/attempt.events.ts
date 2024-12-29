export interface CatchCreatureQuery {
  creatureId: string;
  coordinates: [number, number];
}

export type AttemptEvents = {
  "attempt:catch": CatchCreatureQuery;
};
