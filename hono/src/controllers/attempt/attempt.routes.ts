import { createRoute } from "@hono/zod-openapi";
import { CatchBodySchema, CatchSuccessSchema } from "./attempt.schemas";
import { ErrorCodeSchema } from "../shared/shared.schemas";

//#region POST: /catch
export const postAttemptCatch = createRoute({
  method: "post",
  path: "/catch",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CatchBodySchema,
        },
      },
    },
  },
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
//#endregion
