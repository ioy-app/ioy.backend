import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get votes by instance
 * 
 * @param source_id - User ID
 * @param jam_id - Jam ID
 * @param target_id - Game ID
 * 
 * @example
 * return getVotes(1, 2, 10)
*/
const getVotes = async (
  source_id: number,
  jam_id: number,
  target_id: number
): Promise<number[]> => {
  validate(z.object({
    source_id: IdSchemaCustom("source_id"),
    jam_id: IdSchemaCustom("jam_id"),
    target_id: IdSchemaCustom("target_id")
  }), {
    source_id,
    jam_id,
    target_id
  }, "getVotes");

  const cache_key = `votes:${jam_id}:${source_id}:${target_id}`;
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
      source_id = $1
      AND jam_id = $2
      AND target_id = $3
  `, [
    source_id,
    jam_id,
    target_id
  ]);

  const items = result?.rows?.map((item: { id: number }) => item?.id);
  redis.writeWithLog(cache_key, JSON.stringify(items));

  return items;
}

export default getVotes;