import db from "@/lib/db";
import redis from "@/lib/redis";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get feed
 * @example
 * return getFeedGlobal()
*/
const getFeedGlobal = async (
  offset: number = 0,
  limit: number = 10
): Promise<any> => {
  validate(
    z.object({
      offset: z.number("errors.invalid.offset")
        .int("errors.invalid.offset")
        .nonnegative("errors.invalid.offset"),
      limit: z.number("errors.invalid.limit")
        .int("errors.invalid.limit")
        .nonnegative("errors.invalid.limit")
    }),
    {
      offset,
      limit
    },
    "getFeedGlobal"
  );

  const cache_key = `feed:global:${offset}:${limit}`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const result = JSON.parse(cache);
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  const result = await db.query(`
    WITH Combined AS (
      SELECT
        id, 
        'game' AS type,
        date_created
      FROM "games"
      WHERE status = 'public'
      UNION ALL (
        SELECT
          id,
          'jam' AS type,
          date_created
        FROM "jams"
        UNION ALL
        SELECT
          id,
          'picture' AS type,
          date_created
        FROM "pictures"
      )
    )
    SELECT
      id,
      type,
      date_created,
      COUNT(*) OVER () AS total
    FROM Combined
    ORDER BY date_created DESC
    OFFSET $1 LIMIT $2
  `, [ offset, limit ]);

  if (result.rowCount === 0)
    return null;

  const items = result?.rows?.map((item) => ({
    id: item?.id,
    type: item?.type,
    date_created: item?.date_created
  }));
  const total = Number(result?.rows?.[0]?.total) || 0;
  const data = [ items, total ];

  redis.writeWithLog(cache_key, JSON.stringify(data));
  return data;
}

export default getFeedGlobal;