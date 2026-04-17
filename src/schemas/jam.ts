import z from "zod";
import DateSchema from "./date";
import dayjs from "dayjs";

const JamSchema = z.object({
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
    date_started: DateSchema("date_started")
        .nonoptional({ error: "errors.required.date_started" }),
    /** Jam's date finished */
    date_finished: DateSchema("date_finished")
        .nonoptional({ error: "errors.required.date_finished" }),
    /** Jam's vote date started */
    date_vote_started: DateSchema("date_vote_started")
        .nonoptional({ error: "errors.required.date_vote_started" })
})
.refine((data) => dayjs(data?.date_finished)?.isAfter?.(dayjs(data?.date_started)), {
    message: `errors.date.date_finished.date_started`,
    path: [ "date_finished" ]
})
.refine((data) => dayjs(data?.date_started)?.isAfter?.(dayjs()), {
    message: `errors.date.date_started.now`,
    path: [ "date_started" ]
})
.refine((data) => dayjs(data?.date_vote_started)?.isAfter?.(dayjs(data?.date_started)), {
    message: `errors.date.date_vote_started.date_started`,
    path: [ "date_vote_started" ]
})
.refine((data) => dayjs(data?.date_vote_started)?.isBefore?.(dayjs(data?.date_finished)), {
    message: `errors.date.date_vote_started.date_finished`,
    path: [ "date_vote_started" ]
});

type Jam = z.infer<typeof JamSchema> & {
    /** ID */
    id: number;
    /** Created date */
    date_created?: string;
    /** Vote finished date */
    date_vote_finished: string;
};

export default Jam;
export {
    JamSchema
}