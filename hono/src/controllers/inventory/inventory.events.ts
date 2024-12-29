import { IdQuery } from "../../middleware/mediator/simple-event-payloads";

export type InventoryEvents = {
  "inventory:creatures": IdQuery;
};
