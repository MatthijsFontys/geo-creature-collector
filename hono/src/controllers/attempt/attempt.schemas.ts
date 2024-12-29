import { z } from "zod";

export const CatchSuccessSchema = z.object({
  code: z.number().min(200).max(226),
  message: z.string().nonempty(),
  species: z.string().nonempty(),
  isShiny: z.boolean(),
});
