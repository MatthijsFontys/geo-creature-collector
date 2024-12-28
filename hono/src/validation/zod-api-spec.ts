import { createRoute, z } from "@hono/zod-openapi";
import { CatchSuccessSchema, CreatureViewSchema } from "./zod-api-schemas";
import { HttpStatusCode } from "axios";

/* Statusses used in this file, that can be used as properties */
const STATUS = {
  OK: HttpStatusCode.Ok as number,
  CREATED: HttpStatusCode.Created as number,
  BAD_REQUEST: HttpStatusCode.BadRequest as number,
};

export const getUsersCreatures = createRoute({
  method: "get",
  path: "/creatures",
  responses: {
    [STATUS.OK]: {
      content: {
        "application/json": {
          schema: z.array(CreatureViewSchema).openapi({
            type: "array",
          }),
        },
      },
      description: "Get all the creatures owned by the user",
    },
  },
});

// attempt catch
export const postAttemptCatch = createRoute({
  method: "post",
  path: "/attempt/catch",
  responses: {
    [STATUS.CREATED]: {
      content: {
        "application/json": {
          schema: CatchSuccessSchema,
        },
      },
      description: "The pokemon was caught successfully",
    },
    [STATUS.BAD_REQUEST]: {
      content: {
        "text/plain": {
          schema: z.string().nonempty(),
        },
      },
      description:
        "The creature is not able to get caught, because either it is (no longer) on the map, or the player is too far away",
    },
  },
});
