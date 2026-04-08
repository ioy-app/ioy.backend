import db from "@/lib/db";
import minio from "@/lib/minio";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import Jam, { JamSchema } from "@/schemas/jam";
import validate from "@/utils/validate";
import dayjs from "dayjs";

/**
 * Get jam info
 * @example
 * return getJam(1)
*/
const getJam = async (id: number): Promise<Jam> => {
    validate(IdSchemaCustom("id"), id, "getJam");

    const cache_key = `jam:${id}`;
    const cache = await redis.readWithLog(cache_key);
    if (cache) {
        try {
            const result: Jam = JSON.parse(cache);
            validate(JamSchema, result, "getJam");

            return result;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query<Jam>(`
        SELECT *
        FROM "jams"
        WHERE id = $1
    `, [ id ]);

    if (result.rowCount === 0)
        return null;

    const data: Jam = result.rows[0];

    data.status = "init";
    const current_date = dayjs();
    if (current_date.isAfter(data?.date_started) && current_date.isBefore(data?.date_finished))
        data.status = "in_process";

    if (current_date.isAfter(data?.date_vote_started) && current_date.isBefore(data?.date_vote_finished))
        data.status = "in_voting";

    if (current_date.isAfter(data?.date_finished) || current_date.isAfter(data?.date_vote_finished))
        data.status = "finished";

    data.is_avatar = await minio.checkFileExists("jams", `${id}/icon.png`);
    redis.writeWithLog(cache_key, JSON.stringify(data));
    
    return data;
}

export default getJam;