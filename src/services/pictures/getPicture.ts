import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import Picture from "@/types/picture";
import validate from "@/utils/validate";
import { daily } from "../search";

/**
 * Get picture data
 * 
 * @param id - Picture ID
 * @example
 * return getPicture(10)
*/
const getPicture = async (id: number): Promise<Picture | null> => {
  validate(IdSchemaCustom("id"), id, "getPicture");

  const cache_key = `picture:${id}`;
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
      title,
      description,
      tags,
      creater_id,
      jam_id,
      date_created,
      date_updated,
      status,
      is_background,
      game_id
    FROM "pictures"
    WHERE id = $1
  `, [ id ]);

  if (result.rowCount === 0)
    return null;

  const data = result?.rows?.[0];

  const hype_items = await daily();
    if (Number(hype_items?.picture) == id)
        data.hype = true;

  redis.writeWithLog(cache_key, JSON.stringify(data));
  return data;
}

export default getPicture;