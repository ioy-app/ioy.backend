import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Write score to cache
 * @example
 * return writeScore(1, 1, 10)
*/
const writeScore = async (
  user_id: number,
  game_id: number,
  score: number
): Promise<boolean> => {
  validate(z.object({
    user_id: IdSchemaCustom("user_id"),
    game_id: IdSchemaCustom("game_id"),
    score: z.number("errors.invalid.score")
      .int("errors.invalid.score")
      .nonnegative("errors.invalid.score")
      .nonoptional("errors.required.score")
  }), {
    user_id,
    game_id,
    score
  }, "writeScore");

  await redis.zadd(`highscores:${game_id}`, score, user_id);
  await redis.sadd("highscores:dirty", game_id);

  return true;
}

export default writeScore;