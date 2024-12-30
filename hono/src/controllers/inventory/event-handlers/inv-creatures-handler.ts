import { Context } from "hono";
import { db } from "../../../db/db";
import { creaturesCaughtTable } from "../../../db/db.schema";
import { AppEnvWeak } from "../../../middleware/app-environment";
import { IdQuery } from "../../../middleware/mediator/simple-event-payloads";
import { CreatureResponse } from "../inventory.events";

export const handleInventoryCreatures = async (
  _c: Context<AppEnvWeak>,
  payload: IdQuery<CreatureResponse[]>
) => {
  const creatures = await db.select().from(creaturesCaughtTable);
  payload.response = creatures;
};
