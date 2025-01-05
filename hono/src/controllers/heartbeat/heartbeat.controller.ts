import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "../../middleware/app-environment";
import axios, { HttpStatusCode } from "axios";
import { db } from "../../db/db";
import { sql } from "drizzle-orm";

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
    logHeartbeatError("POSTGIS", error);
    return c.text(
      "🔴 Deegree is: UNAVAILABLE 😓",
      HttpStatusCode.ServiceUnavailable
    );
  }
});

controller.get("/database", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.text("🟢 PostGis is: AVAILABLE 🐘", 200);
  } catch (error) {
    logHeartbeatError("POSTGIS", error);
    return c.text(
      "🔴 PostGis is: UNAVAILABLE 😓",
      HttpStatusCode.ServiceUnavailable
    );
  }
});

function logHeartbeatError(service: string, error: unknown) {
  const header = `########## ${service} HEARTBEAT ERROR ##########`;
  const footer = "#".repeat(header.length);
  console.log(header);
  console.log(error);
  console.log(footer);
}

export default controller;
