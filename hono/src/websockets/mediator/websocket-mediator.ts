import { AppEnvEmpty } from "../../middleware/app-environment";
import { timeHandlers, TimeRuleEvents } from "../rules/time/time.namespace";
import { createEmitter, defineHandlers } from "@hono/event-emitter";
import { Context } from "hono";
import { RuleQuery, RuleResponse } from "../websocket.models";
import { getMediatorResponse } from "../../middleware/mediator/mediator-middleware";

export type AvailableRuleEvents = TimeRuleEvents /* Extendable with  & <other namespacoe> */;

const handlers = defineHandlers<AvailableRuleEvents, AppEnvEmpty>({ ...timeHandlers });
const websocketMediator = createEmitter(handlers);
const mockContext = {} as Context<AppEnvEmpty>;


export function emitWsMediator(
    key: keyof AvailableRuleEvents,
    payload: RuleQuery
) {
    websocketMediator.emit(mockContext, key, payload)
    return payload;
}

export async function emitWsMediatorAsync(
    key: keyof AvailableRuleEvents,
    payload: RuleQuery
) {
   await websocketMediator.emitAsync(mockContext, key, payload) 
   return payload;
}

export function getWsMediatorResponse(responseHolder: RuleQuery) {
    return getMediatorResponse<RuleResponse>(responseHolder);
}

export function isValidRuleEvent(key: string): key is keyof AvailableRuleEvents {
    return Object.keys(handlers).includes(key);
}

