CREATE TABLE "creatures__spawned" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "creatures__spawned_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"geometry" geometry(point) NOT NULL,
	"species" varchar(255) NOT NULL,
	"is_shiny" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creatures__owned" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "creatures__owned_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"species" varchar(255) NOT NULL,
	"creature_id" varchar(255) NOT NULL,
	"is_shiny" boolean NOT NULL,
	CONSTRAINT "creatures__owned_creature_id_unique" UNIQUE("creature_id")
);
