import Request from "@/types/request";
import { Response } from "express";
import getGameByIdService from "@/services/games/getGameById";
import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";
import { UserDetails } from "@/types/user";
import verify from "@/utils/verify";
import checkLikeByGame from "@/services/likes/checkLikeByGame";
import getGamesRecommendsByGame from "@/services/games/getGamesRecommendsByGame";

interface GameResponse extends Game {
    /** Подробная информация о каждом авторе */
    authors_data: UserDetails[];
    /** Поставлен ли лайк на игру */
    is_like?: boolean;
    /** Рекомендации */
    recomendator: Game[];
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
    for (const uid of Array.from(new Set([data.creater_id, ...(data?.authors || [])]))) {
        const login = await getUserLogin(uid);
        authors_data.push(await getUser(login));
    }

    const recomendator = await getGamesRecommendsByGame(data);

    let is_like: boolean;
    if (req.token) {
        const { id: user_id } = await verify(req.token);
        is_like = await checkLikeByGame(Number(user_id), Number(id));
    }

    const obj = {
        ...data,
        authors_data,
        is_like,
        recomendator
    }

    res.status(200).json(obj as GameResponse);
}

export default getGameById;