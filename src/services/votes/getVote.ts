import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Get vote object
 * 
 * @param id - Vote ID
 * @example
 * return getVote(1)
*/
const getVote = async (id: number): Promise<any> => {
  validate(IdSchema, id, "getVote");

  const cache_key = `vote:${id}`;
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
      jam_id,
      source_id,
      target_id,
      nomination,
      score,
      date_created,
      date_updated
    FROM "votes"
    WHERE id = $1
  `, [ id ]);

  if (result.rowCount === 0)
    return null;

  const data = result?.rows?.[0];
  redis.writeWithLog(cache_key, JSON.stringify(data));

  return data;
}

export default getVote;