import db from "@/lib/db";
import redis from "@/lib/redis";

/**
 * Get ids subs by instance
 * @example
 * return getSubsByInstance()
*/
const getSubsByInstance = async (
  instance_id: number,
  instance_type: "jam" | "user" | "game"
): Promise<number[]> => {
  
  const cache_key = `subs:${instance_type}:${instance_id}`;
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
      source_id
    FROM "subscribers"
    WHERE
      target_id = $1
      AND target_type = $2
  `, [ instance_id, instance_type ]);

  if (result.rowCount === 0)
    return null;

  const items: number[] = result?.rows?.map(row => row.source_id);
  redis.writeWithLog(cache_key, JSON.stringify(items));

  return items;
}

export default getSubsByInstance;