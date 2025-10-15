import z from "zod";
import { generalField } from "../../middleware/validation.middleware";

export const freezAccount = {
    params: z.object({
        userId: generalField.id.optional()
    })
}

export const deleteAccount = {
    params: z.object({
        userId: generalField.id
    })
}