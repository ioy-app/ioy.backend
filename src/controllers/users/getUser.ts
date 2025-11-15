import { Response } from "express";
import getUserFollowers from "@services/users/getUserFollowers";
import { default as getUserService } from "@services/users/getUser";
import getUserControls from "@services/users/getUserControls";
import verify from "@utils/verify";
import { UserDetails } from "@/types/user";
import Request from "@/types/request";
import minio from "@/lib/minio";

/**
 * Получение информации о пользователе, подписчиках
 * и кнопок действий
 * 
 * @param {Request} req
 * @param {Response} res
*/
const getUser = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    const data: UserDetails = await getUserService(login);
    data.subscribers = await getUserFollowers(data.id);

    if (req.token) {
        const { id } = await verify(req.token);
        data.controls = await getUserControls(id, data.id);
    }

    const isAvatar = await minio.checkFileExists("users", `${login}.png`)
    data.is_avatar = isAvatar;

    res.status(200).json(data);
}

export default getUser;