import db from "@/lib/db";
import getAISql from "./getAISql";
import logger from "@/lib/logger";

/**
 * Get report result
 * 
 * @param query - Query
 * @example
 * return getReportResult("Get last user info")
*/
const getReportResult = async (query: string, errors: string[] = []): Promise<any> => {
  const sql = await getAISql(query, errors);
  try {
    const result = await db.query(sql);
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