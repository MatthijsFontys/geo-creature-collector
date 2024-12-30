import axios from "axios";
import { CatchCreatureQuery } from "../attempt.events";
import { db } from "../../../db/db";
import { creaturesCaughtTable } from "../../../db/db.schema";
import { Context } from "hono";
import { AppEnv } from "../../../middleware/app-environment";
import { toWeakEnv } from "../../../middleware/mediator/weak-env-handling";

const _handleCatchAttempt = async (
  _c: Context<AppEnv>,
  payload: CatchCreatureQuery
) => {
  const settings = {
    auth: {
      username: process.env.GEO_USERNAME ?? "",
      password: process.env.GEO_PASSWORD ?? "",
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
  const baseUrl = process.env.GEO_SERVICES_URL ?? "";
  const creaturesInRange = await axios.get(`${baseUrl}/CreatureWfs`, settings);

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

// TODO: make an issue on Honos Github so this might get fixed in the future
// TODO: make an issue on my github, to remind me about bugs in third party libraries
/* Example of how to make a handler with a strong Context<AppEnv>, it doesn't matter if it gets exported as weak,
 * because the inner handling uses the strong env, and the strong env is always gets passed, but Hono's middleware does not know that  */
export const handleCatchAttempt = toWeakEnv(_handleCatchAttempt);
