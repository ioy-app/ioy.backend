import db from "@/lib/db";
import redis from "@/lib/redis";
import Jam from "@/schemas/jam";
import dayjs from "dayjs";

/**
 * Get Jams between date
 * @example
 * return getJams()
*/
const getJams = async (date_from: string, date_to: string): Promise<[ number[], number ]> => {
    const dateFromObj = dayjs(date_from);
    let dateToObj = dayjs(date_to);
    if (dateFromObj.isSame(dateToObj)) {
        dateToObj = dateToObj.add(1, 'day');
    }

    const cache_key = `jams:date:${dateFromObj?.format("YYYY-MM-DD")}:${dateToObj?.format("YYYY-MM-DD")}`;
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
            COUNT(*) OVER()::INTEGER as total
        FROM "jams"
        WHERE date_started <= $2 AND date_finished >= $1
    `, [ dateFromObj, dateToObj ]);

    const items = result.rows?.map(row => row.id) || [];
    const total = result.rows?.[0]?.total || 0;
    const data: [ number[], number ] = [ items, total ];

    redis.writeWithLog(cache_key, JSON.stringify(data));

    return data;
}

export default getJams;