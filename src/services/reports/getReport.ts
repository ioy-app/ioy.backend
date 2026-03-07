import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Get report info
 * 
 * @param id - Report ID
 * @example
 * return getReport()
*/
const getReport = async (id: number): Promise<any> => {
    validate(IdSchemaCustom("id"), id, "getReport");
    
    const cache_key = `report:${id}`;
    const cache = await redis.readWithLog(cache_key);
    if (cache) {
        try {
            const result = JSON.parse(cache);
            return result;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            id,
            source_id,
            target_id,
            target_type,
            message,
            type,
            answer,
            answer_id,
            date_created,
            date_answered
        FROM "reports"
        WHERE id=$1
    `, [ id ]);

    if (result.rowCount === 0)
        return null;

    const data = result?.rows?.[0];
    redis.writeWithLog(cache_key, JSON.stringify(data));
    return data;
}

export default getReport;