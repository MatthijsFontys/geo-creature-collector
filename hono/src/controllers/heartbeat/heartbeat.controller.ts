import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "../../middleware/app-environment";
import axios from "axios";
import { db } from "../../db/db";
import { creaturesCaughtTable } from "../../db/db.schema";

export const HONO_HEARTBEAT_TEXT = "🟢 The Hono powered API is: AVAILABLE 🔥";

const controller = new OpenAPIHono<AppEnv>();

controller.get("/hono", (c) => {
  return c.text(HONO_HEARTBEAT_TEXT, 200);
});

controller.get("/deegree", async (c) => {
  try {
    if (!process.env.GEO_URL)
      throw new Error("Deegree dashboard should be in .env, but wasn't");
    await axios.get(process.env.GEO_URL);
    return c.text("🟢 Deegree is: AVAILABLE 🌍", 200);
  } catch (error) {
    return c.text("🔴 Deegree is: UNAVAILABLE 😓", 500);
  }
});

controller.get("/database", async (c) => {
  try {
    await db.select().from(creaturesCaughtTable).limit(0);
    return c.text("🟢 PostGis is: AVAILABLE 🐘");
  } catch (error) {
    return c.text("🔴 PostGis is: UNAVAILABLE 😓", 500);
  }
});

export default controller;
