import ContentError from "@/utils/ContentError";
import getUser from "./getUser";
import redis from "@/lib/redis";
import getUserLogin from "./getUserLogin";
import db from "@/lib/db";

/**
 * Active new user
 *
 * @param login - Login
 * @returns
*/
const setUserActive = async (login: string): Promise<boolean> => {
	const {
		id: user_id,
		active,
		login: local_login
	} = await getUser(login);

	if (active)
		return true;

	const result = await db.query(`
		UPDATE
			"users"
		SET
			active=true
		WHERE id=$1
		RETURNING 1
	`, [ user_id ]);
	if (result?.rowCount === 0)
		throw new ContentError("setUserActive", "errors.exists");

	await redis.delAllWithLog(`user:${local_login}:*`);
	await redis.delAllWithLog(`user_id:${user_id}:*`);
	return true;
}

/**
 * Active new user (With user ID)
 *
 * @param user_id - User ID 
 * @returns 
*/
const setUserIdActive = async (user_id: number): Promise<boolean> => {
	const login = await getUserLogin(user_id);
	return (await setUserActive(login));
}

export default setUserActive;
export {
	setUserIdActive
}
