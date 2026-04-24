import db from "@/lib/db";
import redis from "@/lib/redis";

/**
 * Get user email
 * @param user_id - ID User
 * @example
 * return getEmail(1)
*/
const getEmail = async (user_id: number): Promise<string | null> => {
  const cache_key = `user_id:${user_id}:email`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const result = cache;
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  const result = await db.query(`
    SELECT email
    FROM "users"
    WHERE id = $1
  `, [ user_id ]);

  if (result.rowCount === 0)
    return null;

  const email = result?.rows?.[0]?.email;
  redis.writeWithLog(cache_key, email);
  return email;
}

export default getEmail;