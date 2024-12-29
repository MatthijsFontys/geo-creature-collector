import { z } from "@hono/zod-openapi";

export const CreatureViewSchema = z.object({
  isShiny: z.boolean().openapi({
    description:
      "If the creature is a rare shiny variant with a different color scheme. No shiny variants in the first version, but they are on the roadmap soon after",
  }),
  species: z
    .string()
    .nonempty()
    .openapi({ description: "The name of the creature", example: "Duuk" }),
  creatureId: z.string().nonempty().openapi({
    description:
      "The unique id for this creature, only this creature has this id. If multiple people caught this same creature while on the map they will share this id",
    example: "adamant-crimson-cat",
  }),
  ownerId: z.string().max(0).or(z.undefined()).openapi({
    description:
      "The id of the creature's owner. Not yet implemented, testing with 1 user first ",
  }),
});

export const ErrorCodeSchema = z.object({
  code: z.number().min(400).max(511),
  message: z.string().nonempty(),
  details: z.optional(z.string().nonempty()),
});
