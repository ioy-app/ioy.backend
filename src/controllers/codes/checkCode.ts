import { Request, Response } from "express";
import checkCodeService from "@/services/codes/checkCode";
import deleteCode from "@/services/codes/deleteCode";
import CodeLogin from "./types/codeLogin";

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

    switch(payload?.type) {
        case "login":
            return await CodeLogin(payload, req, res);
        break;
    }

    res.status(404).end();
}

export default checkCode;