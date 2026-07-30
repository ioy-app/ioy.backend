import db from "@/lib/db";
import minio from "@/lib/minio";
import redis from "@/lib/redis";
import LoginSchema from "@/schemas/login";
import UserDetailsSchema from "@/schemas/userDetails";
import { UserDetails } from "@/types/user";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

/**
 * Get user by login
 * 
 * @param login - Login
 * @returns
*/
const getUser = async (login: string): Promise<UserDetails> => {
	validate(LoginSchema, login, "getUser");

	const local_login = login?.trim?.();
	const cache_key = `user:${local_login}`;
	const cache = await redis.readWithLog(cache_key);
	if (cache) {
		try {
			const result = JSON.parse(cache);
			validate(UserDetailsSchema, result, "getUser");
			return result;
		}
		catch { await redis.delWithLog(cache_key); }
	}

	const result = await db.query<UserDetails>(`
		SELECT
			id,
			login,
			description,
			date_created,
			date_deleted,
			date_donut,
			date_ban,
			ban_count,
			role_id,
			active
		FROM "users"
		WHERE
			login = $1
	`, [ local_login ]);

	if (result.rowCount === 0)
		throw new ContentError("getUser", "errors.exists");

	const user = result?.rows?.[0];
	const isBan = user?.date_ban && dayjs(user?.date_ban)?.isAfter?.(dayjs());

	user.is_avatar = !isBan && (await minio.checkFileExists("users", `${local_login}.png`));
	user.is_banner = !isBan && (await minio.checkFileExists("users", `${local_login}_banner.png`));
	user.is_donut = user?.date_donut && dayjs?.()?.isSameOrBefore?.(user?.date_donut);
	
	redis.writeWithLog(cache_key, JSON.stringify(user));
	return user;
}

export default getUser;
