import Request from "@/types/request";
import { Response } from "express";
import getGameByIdService from "@/services/games/getGameById";
import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";
import { UserDetails } from "@/types/user";
import verify from "@/utils/verify";
import checkLikeByGame from "@/services/likes/checkLikeByGame";
import getGamesRecommendsByGame from "@/services/games/getGamesRecommendsByGame";
import Game from "@/schemas/game";
import { checkSubscribe } from "@/services/subscribers";
import minio from "@/lib/minio";
import { getRole } from "@/services/roles";
import { getJam } from "@/services/jams";

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
    if (data.status != "public" && req?.user_id != data.creater_id) {
        console.log(data);
        res.status(404).end();
        return;
    }

    let jamdata;
    if (data.jam_id) {
        jamdata = await getJam(data?.jam_id);
    }

    const authors_data: UserDetails[] = [];
    for (const uid of Array.from(new Set([data.creater_id, ...(data?.authors || [])]))) {
        try {
            const login = await getUserLogin(uid);
            authors_data.push(await getUser(login));
        }
        catch(err) {}
    }

    const recommendator_data = [];
    try {
        const recommendator = await getGamesRecommendsByGame(data);
        for (const g of recommendator) {
            const game_data = await getGameByIdService(g.id);
            recommendator_data.push(game_data);
        }
    }
    catch(err) {}
    

    let is_like: boolean;
    let is_subscribe: boolean;
    let is_me: boolean;
    let is_vote: boolean;
    let roledata = {};
    if (req.token) {
        const { id: user_id } = await verify(req.token);
        const login = await getUserLogin(Number(user_id));
        const userdata = await getUser(login);
        is_like = await checkLikeByGame(Number(user_id), Number(id));
        is_subscribe = await checkSubscribe(Number(user_id), Number(id), "game");
        is_me = Boolean(Number(user_id) == Number(data.creater_id))
        const role = await getRole(userdata.role_id);
        roledata = role;
        if (jamdata?.status == "voting") {
            switch(jamdata?.vote_type) {
                case "judges":
                    if (jamdata?.judges?.length && jamdata?.judges?.includes(user_id))
                    is_vote = true;
                break;
                case "members": {
                    const isMember = await checkSubscribe(user_id, jamdata?.id, "jam");
                    is_vote = isMember;
                } break;
                case "all":
                is_vote = true;
                break;
            }
        }
    }

    const obj = {
        ...data,
        authors_data,
        is_like,
        is_subscribe,
        is_me,
        recommendator: recommendator_data,
        roledata,
        jamdata,
        is_vote
    }

    res.status(200).json(obj as GameResponse);
}

export default getGameById;