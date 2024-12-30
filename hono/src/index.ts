import { WebSocketHandler } from "bun";
import { OpenAPIHono } from "@hono/zod-openapi";
import { AppSetup } from "./setup";
import { BunWebSocketData } from "hono/dist/types/adapter/bun/websocket";
import { AppEnv } from "./middleware/app-environment";
import { DeegreeCommandClient } from "./services/deegree-services/deegree-command-client";

let websocket: WebSocketHandler<BunWebSocketData>;
const app = new OpenAPIHono<AppEnv>().basePath("/api/v1");
const setup = new AppSetup(app);
setup
  .provideSimpleMiddleware()
  .addSimpleHeartbeat()
  .setupMediator()
  .routeControllers()
  .addWebsockets((ws) => (websocket = ws))
  .addOpenApiSpec();

//#region WILL MOVE LATER
// Call to deegree wfs-t
// TODO: this should be a websocket mediation, not an endpoint
app.get("/deegree", async (c) => {
  const deegree = new DeegreeCommandClient();
  const result = await deegree.spawnCreature(
    [749743.7689, -581717.9029],
    "Gengar",
    false
  );

  return c.json(result, 200);
});

//#endregion

export default {
  fetch: app.fetch,
  websocket: websocket!,
};
