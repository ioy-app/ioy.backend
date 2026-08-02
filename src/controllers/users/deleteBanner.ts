import redis from "@/lib/redis";
import Request from "@/types/request";
import deleteFile from "@/utils/deleteFile";
import promisegRPC from "@/utils/promisegRPC";
import { Response } from "express";
import { serviceUsers } from "index";

const deleteBanner = async (req: Request, res: Response): Promise<void> => {
	const url_login = req?.params?.login;
	const id = req.user_id;
	const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: id });	
	if (login != url_login)
		throw new AccessError("errors.denied");	
	const del = await deleteFile("users", `${login}_banner.png`);
	if (del) {
		await redis.delAllWithLog(`users:${login}:*`);
		await redis.delAllWithLog(`user_id:${id}:*`);
	}

	res.status(200).end();
}

export default deleteBanner;
