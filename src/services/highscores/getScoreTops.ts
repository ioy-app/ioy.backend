import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

/**
 * Get top N users
 * @example
 * return getScoreTops(1, 5)
*/
const getScoreTops = async (game_id: number, n: number=10): Promise<any> => {
  validate(IdSchemaCustom("game_id"), game_id, "getScoreTops");

  const key = `highscores:${game_id}`;
  const rows = await redis.zrevrange(
    key,
    0,
    n - 1,
    "WITHSCORES"
  );

  const lines = [];
  for (let i = 0; i < rows?.length; i += 2) {
    const user_id = Number(rows?.[i]);
    const score = Number(rows?.[i + 1]);
    const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id });

    lines.push({
      user_id,
      score,
      login
    });
  }

  return lines;
}

export default getScoreTops;
