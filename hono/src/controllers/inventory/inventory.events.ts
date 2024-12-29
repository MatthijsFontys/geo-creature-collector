import { IdQuery } from "../../middleware/mediator/simple-event-payloads";
import { handleInventoryCreatures } from "./event-handlers/inv-creatures-handler";

export interface AllCreaturesResponse {
  id: number;
  species: string;
  creature_id: string;
  is_shiny: boolean;
}

// Collections to export all events / handlers
export type InventoryEvents = {
  "inventory:creatures": IdQuery<AllCreaturesResponse[]>;
};

export const inventoryHandlers = {
  "inventory:creatures": [handleInventoryCreatures],
};
