import { OpenAPIHono } from "@hono/zod-openapi";
import { HttpStatusCode } from "axios";
import { postAttemptCatch } from "./attempt.routes";
import { AppEnv } from "../../middleware/app-environment";
import { CatchCreatureQuery } from "./attempt.events";
import { Position } from "geojson";
import {
  emitMediatorAsync,
  getMediatorResponse,
} from "../../middleware/mediator/mediator-middleware";
import { CatchResultView } from "./attempt.models";

const controller = new OpenAPIHono<AppEnv>();

/* POST: /api/v1/attempt/catch */
controller.openapi(postAttemptCatch, async (c) => {
  const body = c.req.valid("json");
  const creatureId: string = body.creatureId;
  const coordinates: Position = body.coordinates;

  const query: CatchCreatureQuery = { creatureId, coordinates };
  await emitMediatorAsync(c, "attempt:catch", query);
  const result = getMediatorResponse(query);

  if (result.inRange) {
    const code = HttpStatusCode.Created;
    const view: CatchResultView = {
      code,
      message: "Pokemon Caught!",
      isShiny: result.isShiny!,
      species: result.species!,
    };
    return c.json(view, code);
  } else
    return c.json(
      {
        code: HttpStatusCode.BadRequest,
        message: "No valid pokemon or \nNot in range to catch pokemon",
      },
      HttpStatusCode.BadRequest
    );
});

export default controller;
