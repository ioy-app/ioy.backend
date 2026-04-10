import db from "@/lib/db";
import minio from "@/lib/minio";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import Jam, { JamSchema } from "@/schemas/jam";
import validate from "@/utils/validate";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

    data.status = "finished";
    const current_date = dayjs();

    if (current_date.isBefore(data?.date_started))
        data.status = "init";

    if (current_date.isSameOrAfter(data?.date_started) && current_date.isSameOrBefore(data?.date_finished))
        data.status = "in_process";

    if (current_date.isSameOrAfter(data?.date_vote_started) && current_date.isSameOrBefore(data?.date_vote_finished))
        data.status = "voting";

    

    data.is_avatar = await minio.checkFileExists("jams", `${id}/icon.png`);

    if (data?.status == "init")
        delete data.theme;

    redis.writeWithLog(cache_key, JSON.stringify(data));
    
    return data;
}

export default getJam;