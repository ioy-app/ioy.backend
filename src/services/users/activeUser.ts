import db from "@/lib/db";
import redis from "@/lib/redis";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

/**
 * Activate user with verify code
 * @example
 * return activeUser("waawdXwad_")
*/
const activeUser = async (code: string): Promise<boolean> => {
  try {
    const { id, login } = jwt.verify(code, process.env.SECRET);

    const result = await db.query(`
        UPDATE "users"
        SET
            active=true
        WHERE id=$1 AND login=$2
        RETURNING 1
    `, [ id, login ]);
    
    if (result.rowCount === 0)
        throw new ContentError("activeUser", "errors.denied");

    await redis.delWithLog(`user:${login}`);
    await redis.delAllWithLog(`user_id:${id}:*`);

    return true;
  }
  catch(err) {
    throw new AccessError("activeUser", "errors.exists");
  }
}

export default activeUser;