import axios from "axios";
import { CatchCreatureQuery } from "../attempt.events";
import { db } from "../../../db/db";
import { creaturesCaughtTable } from "../../../db/db.schema";
import { Context } from "hono";
import { AppEnvWeak } from "../../../middleware/app-environment";

export const handleCatchAttempt = async (
  _c: Context<AppEnvWeak>,
  payload: CatchCreatureQuery
) => {
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
      playerLocation: payload.coordinates.join(","),
    },
  };

  const creaturesInRange = await axios.get(
    "http://localhost:9001/deegree/services/CreatureWfs",
    settings
  );

  const creature = creaturesInRange.data.features?.find(
    (x: any) => x.id === payload.creatureId
  );

  const inRange = !!creature;

  await db.insert(creaturesCaughtTable).values({
    species: creature.properties.species,
    is_shiny: creature.properties.is_shiny,
    creature_id: payload.creatureId,
  });

  payload.response = {
    creature,
    inRange,
  };
};
