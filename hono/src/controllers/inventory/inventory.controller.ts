import { OpenAPIHono } from "@hono/zod-openapi";
import { HttpStatusCode } from "axios";
import { getUsersCreatures } from "./inventory.routes";
import {
  emitMediatorAsync,
  getMediatorResponse,
} from "../../middleware/mediator/mediator-middleware";
import { CreatureResponse } from "./inventory.events";
import { IdQuery } from "../../middleware/mediator/simple-event-payloads";
import { AppEnv } from "../../middleware/app-environment";

const controller = new OpenAPIHono<AppEnv>();

/* GET: api/v1/inventory/creatures */
controller.openapi(getUsersCreatures, async (c) => {
  const query: IdQuery<CreatureResponse[]> = { id: "SingleUserApp" }; // Don't have multiple users for now
  await emitMediatorAsync(c, "inventory:creatures", query);
  const creatures = getMediatorResponse(query);

  const creatureViewModels = creatures.map((x) => {
    return {
      isShiny: x.is_shiny,
      creatureId: x.creature_id,
      species: x.species,
    };
  });

  return c.json(creatureViewModels, HttpStatusCode.Ok);
});

export default controller;
