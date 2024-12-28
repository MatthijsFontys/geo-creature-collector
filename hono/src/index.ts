import axios, { HttpStatusCode } from "axios";
import { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { create } from "xmlbuilder2";
import { db } from "./db/db";
import { creaturesCaughtTable } from "./db/schema";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getUsersCreatures, postAttemptCatch } from "./validation/zod-api-spec";

const app = new OpenAPIHono();

// Default get
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.openapi(postAttemptCatch, async (c) => {
  const body = await c.req.json();
  const creatureId = body.creatureId;
  const coordinates = body.coordinates;

  const settings = {
    auth: {
      username: "backend",
      password: "l0Ocal-dev",
    },
    params: {
      service: "WFS",
      version: "2.0.0",
      outputformat: "application/json",
      request: "GetFeature",
      typeNames: "app:creature",
      storedquery_id: "getCreaturesForPlayer",
      playerLocation: coordinates.join(","),
    },
  };
  const creaturesInRange = await axios.get(
    "http://localhost:9001/deegree/services/CreatureWfs",
    settings
  );

  const creature = creaturesInRange.data.features?.find(
    (x: any) => x.id === creatureId
  );

  const inRange = !!creature;

  if (inRange) {
    await db.insert(creaturesCaughtTable).values({
      species: creature.properties.species,
      is_shiny: creature.properties.is_shiny,
      creature_id: creatureId,
    });
    return c.json(
      {
        code: HttpStatusCode.Created,
        message: "Pokemon Caught!",
        isShiny: creature.properties.is_shiny,
        species: creature.properties.species,
      },
      HttpStatusCode.Created
    );
  } else
    return c.json(
      {
        code: HttpStatusCode.BadRequest,
        message: "No valid pokemon or \nNot in range to catch pokemon",
      },
      HttpStatusCode.BadRequest
    );
});

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

// Websockets
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onMessage: (event, ws) => {
        console.log(event.data);
        ws.send("Heya to you too");
      },
    };
  })
);

/* GET: /creatures */
app.openapi(getUsersCreatures, async (c) => {
  const creatures = await db.select().from(creaturesCaughtTable);

  const creatureViewModels = creatures.map((x) => {
    return {
      isShiny: x.is_shiny,
      creatureId: x.creature_id,
      species: x.species,
    };
  });

  return c.json(creatureViewModels, HttpStatusCode.Ok);
});

// API spec
app.doc("/spec", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "Creature Collector",
  },
});

export default {
  fetch: app.fetch,
  websocket,
};
