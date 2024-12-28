import { OpenAPIHono } from "@hono/zod-openapi";
import { getUsersCreatures } from "../validation/zod-api-spec";
import { db } from "../db/db";
import { creaturesCaughtTable } from "../db/schema";
import { HttpStatusCode } from "axios";

const controller = new OpenAPIHono();

/* GET: api/v1/inventory/creatures */
controller.openapi(getUsersCreatures, async (c) => {
  const creatures = await db.select().from(creaturesCaughtTable);

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
