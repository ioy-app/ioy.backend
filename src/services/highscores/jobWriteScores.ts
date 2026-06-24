import redis from "@/lib/redis";
import writeScoreDB from "./writeScoreDB";
import logger from "@/lib/logger";

/**
 * Write scores to db with job
 * @example
 * return jobWriteScoresDB()
*/
const jobWriteScoresDB = async (): Promise<any> => {
  const ids = await redis.smembers("highscores:dirty");

  for (const id of ids) {
    const highscores = await redis.zrevrange(`highscores:${id}`, 0, -1, "WITHSCORES");
    for (let i = 0; i < highscores?.length; i += 2) {
      const user_id = Number(highscores?.[i]);
      const score = Number(highscores?.[i + 1]);
      await writeScoreDB(user_id, Number(id), score);
    }
  }
  await redis.del("highscores:dirty");

  logger.info("Job Write scores is successed!");
  return true;
}

export default jobWriteScoresDB;