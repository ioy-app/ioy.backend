import { getGameById } from "@/services/games";
import { getPicture } from "@/services/pictures";
import promisegRPC from "@/utils/promisegRPC";
import { Request, Response } from "express";
import { serviceUsers } from "index";

const getUserInstances = async (req: Request, res: Response) => {
	const login = req?.params?.login;
	const { offset, limit, includes } = req.query;
	
	const {
		items: content,
		total
	} = await promisegRPC(serviceUsers, "GetUserInstances", {
		login,
		offset,
		limit,
		includes
	});
	const items = [];

	for (const item of content) {
		let inst;
		switch(item?.type) {
			case "game":
				inst = await getGameById(item?.id);
				inst.type = "game";
			break;
			case "picture":
				inst = await getPicture(item?.id);
				inst.type = "picture";
			break;
		}

		items.push(inst);
	}

	res.status(200).json({
		items,
		offset: Number(offset || 0),
		limit: Number(limit || 40),
		total
	});
}

export default getUserInstances;
