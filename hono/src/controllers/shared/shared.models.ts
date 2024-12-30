import { z } from "zod";
import { CreatureViewSchema } from "./shared.schemas";

export type CreatureViewOwned = z.infer<typeof CreatureViewSchema>;
