import z from "zod";

const GameSchema = z.object({
    /** ID */
    id: z.number({ error: "errors.invalid.id" })
        .nonnegative({ error: "errors.invalid.id" })
        .int({ error: "errors.invalid.id" })
        .nonoptional({ error: "errors.required.id" }),
    /** Title */
    title: z.string({ error: "errors.invalid.title" })
        .trim()
        .nonempty({ error: "errors.invalid.title" })
        .max(50, { error: "errors.max.title" })
        .nonoptional({ error: "errors.required.title" }),
    /** Version */
    version: z.string({ error: "errors.invalid.version" })
        .optional(),
    /** Description */
    description: z.string({ error: "errors.invalid.description" })
        .max(255, { error: "errors.max.description" })
        .optional(),
    /** Array tags */
    tags: z.array(z.string({ error: "errors.invalid.tags" }))
        .optional(),
    /** Another authors */
    authors: z.array(z.string({ error: "errors.invalid.authors" }))
        .optional(),
    /** Status */
    status: z.enum([
        "draft",
        "public"
    ], { error: "errors.invalid.status" })
    .nonoptional({ error: "errors.required.status" }),
    /** Jam ID */
    jam_id: z.number({ error: "errors.invalid.jam_id" })
        .nonnegative({ error: "errors.invalid.jam_id" })
        .int({ error: "errors.invalid.jam_id" })
        .optional(),
    /** Author ID */
    creater_id: z.number({ error: "errors.invalid.creater_id" })
        .nonnegative({ error: "errors.invalid.creater_id" })
        .int({ error: "errors.invalid.creater_id" })
        .nonoptional({ error: "errors.required.creater_id" })
});

type Game = z.infer<typeof GameSchema> & {
    /** Created date */
    date_created?: string;
    /** Updated date */
    date_updated?: string;
};

export default Game;
export {
    GameSchema
}