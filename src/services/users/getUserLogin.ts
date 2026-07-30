import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get user login by Id 
 *
 * @param user_id - User ID 
 * @returns 
*/
const getUserLogin = async (user_id: number): Promise<string> => {
	validate(IdSchema, user_id, "getUserLogin");

	const cache_key = `user_id:${user_id}:login`;
	const cache = await redis.readWithLog(cache_key);
	if (cache) {
		try {
			const result = cache;
			return result;
		}
		catch { await redis.delWithLog(cache_key); }
	}

	const result = await db.query<{ login: string }>(`
		SELECT
			login
		FROM "users"
		WHERE
			id = $1
	`, [ user_id ]);
	if (result.rowCount === 0)
		throw new ContentError("getUserLogin", "errors.exists");

	const { login } = result?.rows?.[0];
	redis.writeWithLog(cache_key, login);
	return login;
}

/**
 * Get user login by email 
 * 
 * @param email - Email 
 * @returns
*/
const getUserEmailLogin = async (email: string): Promise<string> => {
	validate(z.email("errors.invalid.email"), email, "getUserEmailLogin");

	const result = await db.query<{ login: string }>(`
		SELECT
			login
		FROM "users"
		WHERE
			email = $1
	`, [ email ]);
	if (result.rowCount === 0)
		throw new ContentError("getUserEmailLogin", "errors.exists");

	const { login } = result?.rows?.[0];
	return login;
}

export default getUserLogin;
export {
	getUserEmailLogin
}
