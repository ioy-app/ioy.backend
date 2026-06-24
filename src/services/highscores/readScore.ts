import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Read score from db
 * @example
 * return readScore(1, 1)
*/
const readScore = async (
  user_id: number,
  game_id: number
): Promise<{
  score: number;
  rank: number | null;
}> => {
  validate(z.object({
    user_id: IdSchemaCustom("user_id"),
    game_id: IdSchemaCustom("game_id")
  }), {
    user_id,
    game_id
  }, "readScore");

  const key = `highscores:${game_id}`;
  const cache = await redis.zscore(key, user_id);
  if (cache) {
    const rank = await redis.zrevrank(key, user_id);
    return {
      score: Number(cache) || 0,
      rank: rank + 1
    }
  }

  const result = await db.query(`
    SELECT
      score
    FROM "highscores"
    WHERE
      user_id = $1
      AND game_id = $2
  `, [
    user_id,
    game_id
  ]);

  const score = result?.rows?.[0]?.score || 0;
  await redis.zadd(key, score, user_id);

  const rank = await redis.zrevrank(key, user_id);
  return {
    rank: rank + 1,
    score
  };
}

export default readScore;