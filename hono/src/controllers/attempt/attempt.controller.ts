import { OpenAPIHono } from "@hono/zod-openapi";
import axios, { HttpStatusCode } from "axios";
import { creaturesCaughtTable } from "../../db/schema";
import { db } from "../../db/db";
import { postAttemptCatch } from "./attempt.routes";

const controller = new OpenAPIHono();

/* POST: /api/v1/attempt/catch */
controller.openapi(postAttemptCatch, async (c) => {
  const body = await c.req.json();
  const creatureId = body.creatureId;
  const coordinates = body.coordinates;

  const settings = {
    auth: {
      username: "backend",
      password: "l0Ocal-dev",
    },
    params: {
      service: "WFS",
      version: "2.0.0",
      outputformat: "application/json",
      request: "GetFeature",
      typeNames: "app:creature",
      storedquery_id: "getCreaturesForPlayer",
      playerLocation: coordinates.join(","),
    },
  };

  const creaturesInRange = await axios.get(
    "http://localhost:9001/deegree/services/CreatureWfs",
    settings
  );

  const creature = creaturesInRange.data.features?.find(
    (x: any) => x.id === creatureId
  );

  const inRange = !!creature;

  if (inRange) {
    await db.insert(creaturesCaughtTable).values({
      species: creature.properties.species,
      is_shiny: creature.properties.is_shiny,
      creature_id: creatureId,
    });
    return c.json(
      {
        code: HttpStatusCode.Created,
        message: "Pokemon Caught!",
        isShiny: creature.properties.is_shiny,
        species: creature.properties.species,
      },
      HttpStatusCode.Created
    );
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
