import { Request, Response } from "express";
import checkCodeService from "@/services/codes/checkCode";
import deleteCode from "@/services/codes/deleteCode";
import CodeLogin from "./types/codeLogin";
import CodeChangeMail from "./types/codeChangeMail";
import CodeDeleteGame from "./types/codeDeleteGame";
import AuthRequest from "@/types/request";
import CodeDeleteUser from "./types/codeDeleteUser";
import CodeDeleteJam from "./types/codeDeleteJam";
import CodeDeletePicture from "./types/codeDeletePicture";

/**
 * Проверка кода подтверждения
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const checkCode = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body;
    const { payload } = await checkCodeService(code);
    await deleteCode(code);

    console.log(payload);

    switch(payload?.type) {
        case "login":
            return (await CodeLogin(payload, req, res));
        break;
        case "change_email":
            return (await CodeChangeMail(payload, req, res));
        break;
        case "delete_user":
            return (await CodeDeleteUser(payload, req, res));
        break;
        case "delete_game":
            return (await CodeDeleteGame(payload as { id: number}, req as AuthRequest, res));
        break;
        case "delete_jam":
            return (await CodeDeleteJam(payload, req, res));
        break;
        case "delete_picture":
            return (await CodeDeletePicture(payload as { id: number}, req as AuthRequest, res));
        break;
    }

    res.status(404).end();
}

export default checkCode;