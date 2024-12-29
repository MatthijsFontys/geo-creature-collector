import { Emitter } from "@hono/event-emitter";
import { AvailableEvents } from "./mediator/mediator-middleware";
import { Context } from "hono";

export type AppEnv = {
  Bindings: {};
  Variables: {
    emitter: Emitter<AvailableEvents>;
  };
};

export function getMediator(context: Context<AppEnv, string>) {
  return context.get("emitter");
}
