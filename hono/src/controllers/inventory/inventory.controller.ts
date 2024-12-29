import { OpenAPIHono } from "@hono/zod-openapi";
import { HttpStatusCode } from "axios";
import { db } from "../../db/db";
import { creaturesCaughtTable } from "../../db/schema";
import { getUsersCreatures } from "./inventory.routes";

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
