import db from "@/lib/db";
import getAISql from "./getAISql";
import logger from "@/lib/logger";
import redis from "@/lib/redis";

/**
 * Get report result
 * 
 * @param query - Query
 * @example
 * return getReportResult("Get last user info")
*/
const getReportResult = async (query: string, errors: string[] = []): Promise<any> => {
  const cache_key = `ai:${query}`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const sql = cache;
      const result = await db.query(sql);
      return {
        result,
        sql
      }
    }
    catch { await redis.delWithLog(cache_key); }
  }
  
  const sql = await getAISql(query, errors);
  try {
    const result = await db.query(sql);
    redis.writeWithLog(cache_key, sql);
    return {
      result: result?.rows,
      sql
    };
  }
  catch(err) {
    logger.error(err, {
      sql
    });
    return (await getReportResult(query, [...errors, err?.message?.toString?.()]));
  }
}

export default getReportResult;