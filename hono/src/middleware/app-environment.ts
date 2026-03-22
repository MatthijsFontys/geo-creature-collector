import { Emitter } from "@hono/event-emitter"; import { AvailableEvents } from "./mediator/mediator-middleware";
import { Context } from "hono";
import { EmptyObject } from "../utils/empty-utils";

interface AppVariables {
  emitter: Emitter<AvailableEvents>;
}

/** Necessary type for library methods that don't allow custom environments. this weak variant satisfies Hono's default Env */
export interface AppEnvWeak {
  Variables?: Partial<AppVariables>;
}

/** Empty environment for websockets events, since currently there is no plan to let them use the context */
export interface AppEnvEmpty {
  Variables?: EmptyObject;
}

/** Regular environment used across the application */
export interface AppEnv {
  Variables: AppVariables;
}

export type AppContext = Context<AppEnv, string>;
