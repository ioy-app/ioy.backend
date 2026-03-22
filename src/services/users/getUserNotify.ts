import db from "@/lib/db";
import getUser from "./getUser";
import getUserId from "./getUserId";
import redis from "@/lib/redis";

type Notify = {
  new_game?: boolean;
  new_jam?: boolean;
  jam_started?: boolean;
  jam_ended?: boolean;
  jam_finish?: boolean;
}

/**
 * Get user notify rules
 * @example
 * return getUserNotify()
*/
const getUserNotify = async (login: string): Promise<Notify> => {
  const id = await getUserId(login);

  const cache_key = `user_id:${id}:notify`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const result = JSON.parse(cache);
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  const result = await db.query(`
    SELECT notify
    FROM "users"
    WHERE id = $1
  `, [ id ]);

  if (result.rowCount === 0)
    return null;

  const data: Notify = result?.rows?.[0]?.notify || {};
  redis.writeWithLog(cache_key, JSON.stringify(data));
  return data;
}

export default getUserNotify;