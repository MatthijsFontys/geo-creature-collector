import {
  integer,
  pgTable,
  varchar,
  boolean,
  geometry,
} from "drizzle-orm/pg-core";

export const creatureTable = pgTable("creatures__spawned", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  geometry: geometry({ type: "point", srid: 28992, mode: "tuple" }).notNull(),
  species: varchar({ length: 255 }).notNull(),
  is_shiny: boolean().notNull().default(false),
});

export const creaturesCaughtTable = pgTable("creatures__owned", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  species: varchar({ length: 255 }).notNull(),
  creature_id: varchar({ length: 255 }).unique().notNull(),
  is_shiny: boolean().notNull(),
  // Octo: Future
  // User Id
  // Traded or w/e
  // OwnerId
  // Original ownerId
  // Exp
});

// Items owned

// Users
