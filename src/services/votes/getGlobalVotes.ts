import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get votes by jam
 * 
 * @param jam_id - Jam ID
 * 
 * @example
 * return getGlobalVotes(1, 2, 10)
*/
const getGlobalVotes = async (
  jam_id: number
): Promise<number[]> => {
  validate(z.object({
    jam_id: IdSchemaCustom("jam_id")
  }), {
    jam_id
  }, "getGlobalVotes");

  const cache_key = `votes:${jam_id}:global`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const result = JSON.parse(cache);
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  const result = await db.query(`
    SELECT id
    FROM "votes"
    WHERE
      jam_id = $1
  `, [
    jam_id
  ]);

  const items = result?.rows?.map((item: { id: number }) => item?.id);
  redis.writeWithLog(cache_key, JSON.stringify(items));

  return items;
}

export default getGlobalVotes;