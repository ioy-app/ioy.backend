import redis from "@/lib/redis";
import getUserLogin from "@/services/users/getUserLogin";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import deleteFile from "@/utils/deleteFile";
import { Response } from "express";

const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
	const url_login = req?.params?.login;
	const id = req.user_id;
	const login = await getUserLogin(Number(id));
	if (login != url_login)
		throw new AccessError("errors.denied");
	const del = await deleteFile("users", `${login}.png`);
	if (del)
		redis.delWithLog(`users:${login}`);

	res.status(200).end();
}

export default deleteAvatar;
