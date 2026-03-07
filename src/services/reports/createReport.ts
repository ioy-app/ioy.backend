import db from "@/lib/db";
import getReport from "./getReport";
import validate from "@/utils/validate";
import z from "zod";
import { IdSchemaCustom } from "@/schemas/id";

/**
 * Create new report for instance
 * @example
 * return createReport()
*/
const createReport = async (
    source_id: number,
    target_id: number,
    type: "game" | "user" | "jam" | "comment",
    message: string
): Promise<any> => {
    validate(z.object({
        source_id: IdSchemaCustom("source_id"),
        target_id: IdSchemaCustom("target_id"),
        type: z.enum(["game", "user", "jam", "comment"], { error: "errors.invalid.type" })
            .nonoptional({ error: "errors.required.type" }),
        message: z.string({ error: "errors.invalid.message" })
            .trim()
            .nonempty({ error: "errors.invalid.message" })
            .nonoptional({ error: "errors.required.message" })
    }), {
        source_id,
        target_id,
        type,
        message
    }, "createReport");

    const result = await db.query(`
        INSERT INTO "reports" (
            source_id,
            target_id,
            target_type,
            message,
            type
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            'default'
        )
        RETURNING id
    `, [
        source_id,
        target_id,
        type,
        message
    ]);

    if (result.rowCount === 0)
        return null;

    const id = result?.rows?.[0]?.id;
    return (await getReport(id));
}

export default createReport;