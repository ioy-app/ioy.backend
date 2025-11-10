import Request from "@/types/request";
import { Response } from "express";
import getGameByIdService from "@/services/games/getGameById";
import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";
import { UserDetails } from "@/types/user";

interface GameResponse extends Game {
    /** Подробная информация о каждом авторе */
    authors_data: UserDetails[];
}

/**
 * Получение игры по ID
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const getGameById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = await getGameByIdService(Number(id));

    const authors_data: UserDetails[] = [];
    for (const uid of Array.from(new Set([data.creater_id, ...data.authors]))) {
        const login = await getUserLogin(uid);
        authors_data.push(await getUser(login));
    }

    res.status(200).json({
        ...data,
        authors_data
    } as GameResponse);
}

export default getGameById;