import { CatchCreatureQuery, CatchCreatureResponse } from "../attempt.events";
import { db } from "../../../db/db";
import { creaturesCaughtTable } from "../../../db/db.schema";
import { Context } from "hono";
import { AppEnv } from "../../../middleware/app-environment";
import { toWeakEnv } from "../../../middleware/mediator/weak-env-handling";
import { DeegreeQueryClient } from "../../../services/deegree-services/deegree-query-client";

const _handleCatchAttempt = async (
  _c: Context<AppEnv>,
  payload: CatchCreatureQuery
) => {
  const deegree = new DeegreeQueryClient();
  const creaturesInRange = await deegree.getCreaturesForPlayer(
    payload.coordinates,
    "_somePlayerId"
  );

  const creature = creaturesInRange.data.features?.find(
    (x: any) => x.id === payload.creatureId
  );

  const inRange = !!creature;

  if (inRange) {
    await db.insert(creaturesCaughtTable).values({
      species: creature.properties.species,
      is_shiny: creature.properties.is_shiny,
      creature_id: payload.creatureId,
    });
  }

  const response: CatchCreatureResponse = {
    isShiny: creature?.properties.is_shiny,
    species: creature?.properties.species,
    inRange,
  };

  payload.response = response;
};

// TODO: make an issue on Honos Github so this might get fixed in the future
// TODO: make an issue on my github, to remind me about bugs in third party libraries
/* Example of how to make a handler with a strong Context<AppEnv>, it doesn't matter if it gets exported as weak,
 * because the inner handling uses the strong env, and the strong env is always gets passed, but Hono's middleware does not know that  */
export const handleCatchAttempt = toWeakEnv(_handleCatchAttempt);
