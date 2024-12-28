import { createRoute, z } from "@hono/zod-openapi";
import {
  CatchSuccessSchema,
  CreatureViewSchema,
  ErrorCodeSchema,
} from "./zod-api-schemas";

export const getUsersCreatures = createRoute({
  method: "get",
  path: "/creatures",
  responses: {
    200: /* OK */ {
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
  path: "/catch",
  responses: {
    201: /* CREATED */ {
      content: {
        "application/json": {
          schema: CatchSuccessSchema,
        },
      },
      description: "The pokemon was caught successfully",
    },
    400: /* BAD REQUEST */ {
      content: {
        "application/json": {
          schema: ErrorCodeSchema,
        },
      },
      description:
        "The creature is not able to get caught, because either it is (no longer) on the map, or the player is too far away",
    },
  },
});
