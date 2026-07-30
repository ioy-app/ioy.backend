import redis from "@/lib/redis";
import getUser from "./getUser";
import ContentError from "@/utils/ContentError";
import getUserLogin from "./getUserLogin";
import db from "@/lib/db";

/**
 * Get user email 
 *
 * @param login - Login
 * @returns
*/
const getUserEmail = async (login: string): Promise<string> => {
	const user = await getUser(login);

	const cache_key = `user:${user?.login}:email`;
	const cache = await redis.readWithLog(cache_key);
	if (cache) {
		try {
			const result = cache;
			return result;
		}
		catch { await reids.delWithLog(cache_key); }
	}

	const result = await db.query<{ email: string }>(`
		SELECT
			email
		FROM "users"
		WHERE
			id = $1
	`, [ user?.id ]);

	if (result?.rowCount === 0)
		throw new ContentError("getUserEmail", "errors.exists");

	const { email } = result?.rows?.[0];
	redis.writeWithLog(cache_key, email);
	return email;
}

/**
 * Get user email (With user ID)
 *
 * @param user_id - User ID 
 * @returns
*/
const getUserIdEmail = async (user_id: number): Promise<string> => {
	const login = await getUserLogin(user_id);
	return (await getUserEmail(login));
}

export default getUserEmail;
export {
	getUserIdEmail
}
