import { AttemptEvents } from "../../controllers/attempt/attempt.events";
import { InventoryEvents } from "../../controllers/inventory/inventory.events";

export type AvailableEvents = AttemptEvents & InventoryEvents;
