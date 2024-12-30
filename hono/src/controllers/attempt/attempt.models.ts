import { z } from "zod";
import { CatchSuccessSchema } from "./attempt.schemas";

export type CatchResultView = z.infer<typeof CatchSuccessSchema>;
