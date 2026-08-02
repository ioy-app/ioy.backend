import Request from "@/types/request.js";
import { Request, Response } from "express";
import { Multer } from "multer";
import AccessError from "@/utils/AccessError";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

/**
 * Редактирование пользовательских данных
 * 
 * @param req - Запрос
 * @param res - Ответ
*/
const putUser = async (req: Request & { file?: Multer }, res: Response): Promise<void> => {
	const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: req?.user_id });  

    if (req?.body?.privacy)
        for (const [key, value] of Object.entries(req.body.privacy))
            req.body.privacy[key]= Boolean(value == "true");
    if (req?.body?.notify)
        for (const [key, value] of Object.entries(req.body.notify))
            req.body.notify[key]= Boolean(value == "true");

    const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
    if (userdata.id != req.user_id)
        throw new AccessError("putUser", "errors.denied");

		const avatar = req?.files?.find?.((file) => file?.fieldname == "avatar");
		const banner = req?.files?.find?.((file) => file?.fieldname == "banner");

    if (avatar && avatar?.size > (1 * 1024 * 1024))
        throw new AccessError("putUser", "errors.avatar_limit");

    if (avatar && avatar?.mimetype != "image/png")
        throw new AccessError("putUser", "errors.avatar_type");

		if (banner && banner?.size > (1 * 1024 * 1024))
        throw new AccessError("putUser", "errors.banner_limit");

    if (banner && banner?.mimetype != "image/png")
        throw new AccessError("putUser", "errors.banner_type");

    await promisegRPC(serviceUsers, "EditUser", {
			login,
			params: {
				...(req?.body || {}),
				avatar: avatar && avatar?.buffer || undefined,
				banner: banner && banner?.buffer || undefined
			}
		});

		const updated = await promisegRPC(serviceUsers, "GetUser", { login: req?.body?.login || login });
    res.status(200).json(updated);
}

export default putUser;
