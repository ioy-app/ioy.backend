import { getUserSubs } from "@/services/subscribers";
import Request from "@/types/request";
import promisegRPC from "@/utils/promisegRPC";
import { Response } from "express";
import { serviceUsers } from "index";

const getFollowing = async (req: Request, res: Response): Promise<void> => {
	const { offset, limit, sort } = req?.query;
	const [ content, total ] = await getUserSubs(
		req?.user_id,
		"user",
		Number(offset) || 0,
    Number(limit) || 10,
		sort || "new"
	);
	const items = [];

	for (const user_id of content) {
		const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id });
		const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
		items.push(userdata);
	}

	res.status(200).json({
    items,
    total,
    offset,
    limit
  });
}

export default getFollowing;
