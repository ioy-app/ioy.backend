import { Response } from "express";
import verify from "@/utils/verify";
import Request from "@/types/request";
import dayjs from "dayjs";
import AccessError from "@/utils/AccessError";
import { checkSubscribe, getSubsCounterByInstance } from "@/services/subscribers";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

/**
 * Получение информации о пользователе, подписчиках
 * и кнопок действий
 * 
 * @param req - Запрос
 * @param res - Ответ
*/
const getUser = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    const data = await promisegRPC(serviceUsers, "GetUser", { login });
		if (data?.date_ban && dayjs(data?.date_ban).isAfter(dayjs()))
        throw new AccessError("getUser", "errors.denied");

    data.subscribers = await getSubsCounterByInstance(data.id, "user");
    if (req.token) {
        const { id } = await verify(req.token);
        data.controls = {
					is_subscribe: await checkSubscribe(id, data?.id, "user"),
        	is_me: Boolean(id == data?.id)
				}		
    }

    res.status(200).json(data);
}

export default getUser;
