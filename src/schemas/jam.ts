import z from "zod";

const JamSchema = z.object({
    /** ID */
    id: z.number({ error: "errors.invalid.id" })
        .nonnegative({ error: "errors.invalid.id" })
        .int({ error: "errors.invalid.id" })
        .nonoptional({ error: "errors.required.id" }),
    /** Title */
    title: z.string({ error: "errors.invalid.title" })
        .trim()
        .nonempty({ error: "errors.invalid.title" })
        .nonoptional({ error: "errors.required.title" }),
    /** Theme */
    theme: z.string({ error: "errors.invalid.theme" })
        .trim()
        .nonempty({ error: "errors.invalid.theme" })
        .nonoptional({ error: "errors.required.theme" }),
    /** Description */
    description: z.string({ error: "errors.invalid.description" })
        .optional(),
    /** Nominations */
    nominations: z.array(
        z.string({ error: "errors.invalid.nomination" })
            .trim()
            .nonempty({ error: "errors.invalid.nomination" })
            .nonoptional({ error: "errors.required.nomination" }),
        { error: "errors.invalid.nominations" }
    ).nonoptional({ error: "errors.required.nominations" }),
    /** Jam's author */
    creater_id: z.number({ error: "errors.invalid.creater_id" })
        .nonnegative({ error: "errors.invalid.creater_id" })
        .int({ error: "errors.invalid.creater_id" })
        .nonoptional({ error: "errors.required.creater_id" }),
    /** Judges */
    judges: z.array(
        z.number({ error: "errors.invalid.judge" })
            .nonnegative({ error: "errors.invalid.judge" })
            .int({ error: "errors.invalid.judge" })
            .nonoptional({ error: "errors.required.judge" })
    ).optional(),
    /** Type of voting */
    vote_type: z.enum([
        "all",
        "judges",
        "members"
    ], { error: "errors.invalid.vote_type" }),
    /** Jam's date started */
    date_started: z.string({ error: "errors.invalid.date_started" })
        .nonoptional({ error: "errors.required.date_started" }),
    /** Jam's date finished */
    date_finished: z.string({ error: "errors.invalid.date_finished" })
        .nonoptional({ error: "errors.required.date_finished" }),
    /** Jam's vote date started */
    date_vote_started: z.string({ error: "errors.invalid.date_vote_started" })
        .nonoptional({ error: "errors.required.date_vote_started" }),
    /** Jam's vote date finished */
    date_vote_finished: z.string({ error: "errors.invalid.date_vote_finished" })
        .nonoptional({ error: "errors.required.date_vote_finished" })
});

type Jam = z.infer<typeof JamSchema> & {
    /** Created date */
    date_created?: string;
};

export default Jam;
export {
    JamSchema
}