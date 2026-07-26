import { getGameById } from "@/services/games";
import { getPicture } from "@/services/pictures";
import getUserId from "@/services/users/getUserId";
import getUserInstancesService from "@/services/users/getUserInstances";
import { Request, Response } from "express";

const getUserInstances = async (req: Request, res: Response) => {
	const login = req?.params?.login;
	const { offset, limit } = req.query;
	
	const user_id = await getUserId(login);
	const [ content, total ] = await getUserInstancesService(user_id, Number(offset || 0), Number(limit || 40));
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
