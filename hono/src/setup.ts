import { OpenAPIHono } from "@hono/zod-openapi";
import attemptController from "./controllers/attempt/attempt.controller";
import { BunWebSocketData } from "hono/dist/types/adapter/bun/websocket";
import { createBunWebSocket } from "hono/bun";
import { WebSocketHandler } from "bun";
import { trimTrailingSlash } from "hono/trailing-slash";
import { logger } from "hono/logger";
import { emitter } from "@hono/event-emitter";
import { AppEnv } from "./middleware/app-environment";
import inventoryController from "./controllers/inventory/inventory.controller";

export class AppSetup {
  constructor(private readonly _app: OpenAPIHono<AppEnv>) {}

  provideSimpleMiddleware(): this {
    this._app.use(logger()).use(trimTrailingSlash());
    this._app.use(emitter());
    return this;
  }

  addSimpleHeartbeat(): this {
    this._app.get("/", (c) => {
      return c.text("🟢 The Hono powered API is: AVAILABLE 🔥");
    });
    return this;
  }

  routeControllers(): this {
    this._app.route("/attempt", attemptController);
    this._app.route("/inventory", inventoryController);
    return this;
  }

  addWebsockets(tabFn: (ws: WebSocketHandler<BunWebSocketData>) => void): this {
    const { upgradeWebSocket, websocket } = createBunWebSocket();
    tabFn(websocket);
    this._app.get(
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
    return this;
  }

  addOpenApiSpec(): this {
    this._app.doc("/spec", {
      openapi: "3.0.0",
      info: {
        version: "0.0.1",
        title: "Creature Collector",
      },
    });
    return this;
  }
}
