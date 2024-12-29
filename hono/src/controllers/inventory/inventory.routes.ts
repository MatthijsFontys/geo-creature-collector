import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CreatureViewSchema } from "../shared/shared.schemas";

//#region GET: /creatures/
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
//#endregion
