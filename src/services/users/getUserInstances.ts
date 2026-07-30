import validate from "@/utils/validate";
import z from "zod";
import getUser from "./getUser";
import redis from "@/lib/redis";
import es from "@/lib/elasticsearch";
import getUserLogin from "./getUserLogin";

const indexes = [ "games", "pictures" ] as const;
type IndexType = typeof indexes[number];

type ResultInstanceProps = {
	id: number;
	type: "game" | "picture";
}

/**
 * Get instances by user
 * 
 * @param login - Login 
 * @param offset - Offset 
 * @param limit - Limit
 * @param include - Tables with instances
 * @returns
*/
const getUserInstances = async (
	login: string,
	offset: number = 0,
	limit: number = 40,
	include: IndexType[] = indexes
): Promise<[ ResultInstanceProps, number ]> => {	
	validate(z.object({
		offset: z.number("errors.invalid.offset")
			.int("errors.invalid.offset")
			.nonnegative("errors.invalid.offset")
			.optional(),
		limit: z.number("errors.invalid.limit")
			.int("errors.invalid.limit")
			.nonnegative("errors.invalid.limit")
			.min(1, "errors.invalid.limit")
			.max(50, "errors.invalid.limit")
			.optional(),
		include: z.array(
			z.enum(indexes, "errors.invalid.include"),
			"errors.invalid.include"
		).optional()
	}), {
		offset,
		limit,
		include
	}, "getUserInstances");

	const {
		id: user_id,
		login: local_login
	} = await getUser(login);

	const cache_key = `user:${local_login}:instances`;
	const cache = await redis.readWithLog(cache_key);
	if (cache) {
		try {
			const result = JSON.parse(cache);
			return result;
		}
		catch { await redis.delWithLog(cache_key); }
	}

	const { hits } = await es.search({
		index: include,
		from: offset,
		size: limit,
		query: {
			term: {
				creater_id: user_id
			}
		},
		sort: [
			{ date_created: { order: "desc" } },
			{ date_updated: { order: "desc" } }
		]
	});

	const total = hits?.total?.value || 0;
	const items = hits?.hits?.map?.((item) => ({
		id: Number(item?._id),
		type: item?._source?.type
	}));
	const result = [ items, total ];
	
	redis.writeWithLog(cache_key, result);
	return result;
}

/**
 * Get instances by user (With user ID)
 *
 * @param user_id - User ID 
 * @param offset - Offset 
 * @param limit - Limit 
 * @param include - Tables with instances 
 * @returns
*/
const getUserIdInstances = async (
	user_id: number,
	offset: number = 0,
	limit: number = 40,
	include: IndexType[] = indexes 
): Promise<[ ResultInstanceProps, number ]> => {
	const login = await getUserLogin(user_id);
	return (await getUserInstances(login, offset, limit, include));
}

export default getUserInstances;
export {
	getUserIdInstances
}
