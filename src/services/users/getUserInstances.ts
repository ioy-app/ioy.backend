import es from "@/lib/elasticsearch";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

const getUserInstances = async (
	user_id: number,
	offset: number = 0,
	limit: number = 40
) => {
	validate(z.object({
		user_id: z.number("errors.invalid.user_id")
			.int("errors.invalid.user_id")
			.nonnegative("errors.invalid.user_id")
			.nonoptional("errors.required.user_id"),
		offset: z.number("errors.invalid.offset")
			.nonnegative("errors.invalid.offset")
			.optional(),
		limit: z.number("errors.invalid.limit")
			.nonnegative("errors.invalid.limit")
			.optional()
	}), {
		user_id,
		offset,
		limit
	}, "getUserInstances");

	const { hits } = await es.search({
		index: "games,pictures",
		from: offset,
		size: limit,
		query: {
			term: {
				creater_id: user_id
			}
		},
		sort: [
			{
				date_created: {
					order: "desc"
				}
			}
		]
	});

	const total = hits.total.value;
	const items = hits?.hits?.map?.((item) => ({
		id: Number(item?._id),
		...item?._source
	}));

	return [ items, total ];
}

export default getUserInstances;
