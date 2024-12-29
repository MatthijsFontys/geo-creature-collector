import axios from "axios";
import { WebSocketHandler } from "bun";
import { create } from "xmlbuilder2";
import { OpenAPIHono } from "@hono/zod-openapi";
import { AppSetup } from "./setup";
import { BunWebSocketData } from "hono/dist/types/adapter/bun/websocket";
import { AppEnv } from "./middleware/app-environment";

let websocket: WebSocketHandler<BunWebSocketData>;
const app = new OpenAPIHono<AppEnv>().basePath("/api/v1");
const setup = new AppSetup(app);
setup
  .provideSimpleMiddleware()
  .addSimpleHeartbeat()
  .routeControllers()
  .addWebsockets((ws) => (websocket = ws))
  .addOpenApiSpec();

//#region WILL MOVE LATER
// Call to deegree wfs-t
// TODO: this should be a websocket mediation, not an endpoint
// TODO: extend the existing builder, factory pattern style
app.get("/deegree", (c) => {
  const builder = create({ version: "1.0" });
  const transactionXml = builder
    .ele("wfs:Transaction", {
      service: "WFS",
      version: "2.0.0",
      "xmlns:wfs": "http://www.opengis.net/wfs/2.0",
      "xmlns:gml": "http://www.opengis.net/gml/3.2",
      "xmlns:app": "http://www.deegree.org/app",
    })
    .ele("wfs:Insert")
    .ele("app:creature")
    .ele("app:geometry")
    .ele("gml:Point", { srsName: "EPSG:4326" })
    .ele("gml:pos")
    .txt("12.3456 78.9012")
    .up(/* Close gml:pos */)
    .up(/* Close gml:Point */)
    .up(/* Close app:geometry */)
    .ele("app:creature")
    .txt("Altaria")
    .up(/* Close app:creature */)
    .ele("app:is_shiny")
    .txt("true")
    .up(/* Close app:is_shiny */)
    .up(/* Close app:creature */)
    .up(/* Close wfs:Insert */)
    .up(/* Close wfs:Transaction */)
    .doc()
    .end({ prettyPrint: true });

  const config = {
    headers: { "Content-Type": "text/xml" },
  };

  axios.post(
    "http://localhost:9001/deegree/services/MyWfs?service=WFS&version=2.0.0&request=Transaction",
    transactionXml,
    config
  );

  return c.text(transactionXml);
});

//#endregion

export default {
  fetch: app.fetch,
  websocket: websocket!,
};
