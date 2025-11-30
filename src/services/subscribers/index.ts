import z from "zod";

export const validObj = z.object({
    user_id: z.number({ error: "errors.invalid.id" })
        .nonnegative({ error: "errors.invalid.id" })
        .nonoptional({ error: "errors.required.id" }),
    offset: z.number({ error: "errors.invalid.offset" })
        .nonnegative({ error: "errors.invalid.offset" })
        .optional(),
    limit: z.number({ error: "erros.invlaid.limit" })
        .nonnegative({ error: "errors.invalid.limit" })
        .optional()
});