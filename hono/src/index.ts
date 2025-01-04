import { WebSocketHandler } from "bun";
import { OpenAPIHono } from "@hono/zod-openapi";
import { AppSetup } from "./setup";
import { BunWebSocketData } from "hono/dist/types/adapter/bun/websocket";
import { AppEnv } from "./middleware/app-environment";
import { DeegreeCommandClient } from "./services/deegree-services/deegree-command-client";
import { DeegreeQueryClient } from "./services/deegree-services/deegree-query-client";
import { HttpStatusCode } from "axios";

let websocket: WebSocketHandler<BunWebSocketData>;
const app = new OpenAPIHono<AppEnv>().basePath("/api/v1");
const setup = new AppSetup(app);
setup
  .provideSimpleMiddleware()
  .addHeartbeats()
  .setupMediator()
  .routeControllers()
  .addWebsockets((ws) => (websocket = ws))
  .addOpenApiSpec();

//#region WILL MOVE LATER
// Call to deegree wfs-t
// TODO: this should be a websocket mediation, not an endpoint
app.post("/test/deegree/spawn", async (c) => {
  const deegree = new DeegreeCommandClient();
  const result = await deegree.spawnCreature(
    [749743.7689, -581717.9029],
    "Gengar",
    false
  );

  return c.json(result, HttpStatusCode.Ok);
});

// TODO: this should happen in websocket mediation, not an endpoint
//#region Test endpoints to test the api, as this functionality will only hbe called through websockets in the future
app.delete("test/deegree/despawn/:id", async (c) => {
  const deegree = new DeegreeCommandClient();
  const result = await deegree.despawnCreature(c.req.param("id"));
  return c.json(result, HttpStatusCode.NoContent);
});

app.get("test/deegree/spawnersForPlayer", async (c) => {
  const deegree = new DeegreeQueryClient();
  const result = await deegree.getSpawnersForPlayer(
    [170814.0195, 384842.8205],
    "SomePlayerId"
  );
  return c.json(result.data, HttpStatusCode.Ok);
});

// Currently spawned creatures near the player
app.get("test/deegree/creaturesForPlayer", async (c) => {
  const deegree = new DeegreeQueryClient();
  const result = await deegree.getCreaturesForPlayer(
    [171316.4236, 385841.7762285521],
    "SomePlayerId"
  );
  return c.json(result.data, HttpStatusCode.Ok);
});
//#endregion

export default {
  fetch: app.fetch,
  websocket: websocket!,
};
