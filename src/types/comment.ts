import { IdSchemaCustom } from "@/schemas/id";
import z from "zod";

export const CommentValidate = z.object({
    id: IdSchemaCustom("id"),
    source_id: IdSchemaCustom("source_id"),
    target_id: IdSchemaCustom("target_id"),
    target_type: z.enum([ "game", "comment" ], { error: "errors.invalud.target_type" })
        .nonoptional({ error: "errors.required.target_type" }),
    comment: z.string({ error: "errors.invalid.comment" })
        .trim()
        .nonempty({ error: "errors.required.comment" })
        .nonoptional({ error: "errorsrequired.comment" }),
    deleted: z.boolean({ error: "errors.invalid.deleted"})
        .optional(),
    date_created: z.date({ error: "errors.invalid.date_created" })
        .nonoptional({ error: "errors.required.date_created" }),
    date_updated: z.date({ error: "errors.invalid.date_updated" })
        .optional()
});

type Comment = z.infer<typeof CommentValidate>;
export default Comment;