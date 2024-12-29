import { Context } from "hono";
import {
  AttemptEvents,
  attemptHandlers,
} from "../../controllers/attempt/attempt.events";
import {
  InventoryEvents,
  inventoryHandlers,
} from "../../controllers/inventory/inventory.events";
import { AppEnv, AppEnvWeak } from "../app-environment";
import { defineHandlers, Emitter } from "@hono/event-emitter";

export type AvailableEvents = AttemptEvents & InventoryEvents;

export const availableHandlers = defineHandlers<AvailableEvents, AppEnvWeak>({
  ...attemptHandlers,
  ...inventoryHandlers,
});

//#region Supply mediator result
export interface HasResponse<T> {
  response?: T;
}

export function getMediatorResponse<T>(responseHolder: HasResponse<T>): T {
  if (responseHolder.response !== undefined) {
    return responseHolder.response;
  } else {
    throw new Error(
      "The mediator call should have resulted in a response, but didn't"
    );
  }
}
//#endregion

//#region Shorcuts for getting mediator access in controller
export function getMediator(
  context: Context<AppEnv, string>
): Emitter<AvailableEvents> {
  return context.get("emitter");
}

export async function emitMediatorAsync(
  context: Context<AppEnv, string>,
  key: keyof AvailableEvents,
  payload: AvailableEvents[keyof AvailableEvents]
) {
  const mediator = getMediator(context);
  await mediator.emitAsync(context, key, payload);
}

export function emitMediator([context, key, payload]: Parameters<
  typeof emitMediatorAsync
>) {
  const mediator = getMediator(context);
  mediator.emit(context, key, payload);
}
//#endregion
