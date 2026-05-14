import db from "@/lib/db";
import getReport from "./getReport";
import validate from "@/utils/validate";
import z from "zod";
import { IdSchemaCustom } from "@/schemas/id";
import redis from "@/lib/redis";

/**
 * Create new report for instance
 * @example
 * return createReport()
*/
const createReport = async (
    source_id: number,
    target_id: number,
    target_type: "game" | "user" | "jam" | "comment" | "picture",
    message: string
): Promise<any> => {
    validate(z.object({
        source_id: IdSchemaCustom("source_id"),
        target_id: IdSchemaCustom("target_id"),
        target_type: z.enum([
            "game",
            "user",
            "jam",
            "comment",
            "picture"
        ], "errors.invalid.target_type")
        .nonoptional("errors.required.target_type"),
        message: z.string("errors.invalid.message")
            .trim()
            .nonempty("errors.invalid.message")
            .nonoptional("errors.required.message")
    }), {
        source_id,
        target_id,
        target_type,
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
        target_type,
        message
    ]);

    if (result.rowCount === 0)
        return null;

    const id = result?.rows?.[0]?.id;
    await redis.delAllWithLog(`reports:*`);
    return (await getReport(id));
}

export default createReport;