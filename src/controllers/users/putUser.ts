import Request from "@/types/request.js";
import { Request as RequestExpress, Response } from "express";
import putUserService from "@/services/users/putUser.js";
import { Multer } from "multer";
import getUser from "@/services/users/getUser";
import AccessError from "@/utils/AccessError";

/**
 * Редактирование пользовательских данных
 * 
 * @param req - Запрос
 * @param res - Ответ
*/
const putUser = async (req: Request & { file?: Multer }, res: Response): Promise<void> => {
    const { login } = req.params;

    if (req?.body?.privacy)
        for (const [key, value] of Object.entries(req.body.privacy))
            req.body.privacy[key]= Boolean(value == "true");

    const userdata = await getUser(login);
    if (userdata.id != req.user_id)
        throw new AccessError("putUser", "errors.denied");

    console.log(req.file, req.body);

    const data = await putUserService(
        login,
        req.body,
        req?.file && req.file.buffer || null
    );
    res.status(200).json(data);
}

export default putUser;