import createUser from "@services/users/createUser";
import { Request, Response } from "express";

/**
 * Регистрация новой учетной записи
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Reg = async (req: Request, res: Response): Promise<void> => {
    const { login, email } = req.body;

    await createUser(login, email);
    // Здесь должна быть логика на отправку письма с активацией учетной записи

    res.status(200);
}

export default Reg;