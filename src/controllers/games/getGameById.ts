import Request from "@/types/request";
import { Response } from "express";
import getGameByIdService from "@/services/games/getGameById";
import verify from "@/utils/verify";
import getGamesRecommendsByGame from "@/services/games/getGamesRecommendsByGame";
import Game from "@/schemas/game";
import { checkSubscribe } from "@/services/subscribers";
import { getRole } from "@/services/roles";
import { getJam } from "@/services/jams";
import { checkLikeByInstance } from "@/services/likes";
import { getPicture, getPictureByGame } from "@/services/pictures";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

interface GameResponse extends Game {
    authors_data: Record<string, unknown>[];
    is_like?: boolean;
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
        res.status(404).end();
        return;
    }

    let jamdata;
    if (data.jam_id) {
        jamdata = await getJam(data?.jam_id);
    }

    const authors_data = [];
    for (const uid of Array.from(new Set([data.creater_id, ...(data?.authors || [])]))) {
        try {
						const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: uid });
            authors_data.push(await promisegRPC(serviceUsers, "GetUser", { login }));
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


    let picturedata;
    if (data.is_background) {
        const picture_id = await getPictureByGame(Number(id));
        if (picture_id) {
            picturedata = await getPicture(picture_id);
        }
    }

    let is_like: boolean;
    let is_me: boolean;
    let is_vote: boolean;
    let roledata = {};
    if (req.token) {
        const { id: user_id } = await verify(req.token);
        const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id });
        const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
        is_like = await checkLikeByInstance(Number(user_id), Number(id), "game");
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
        is_me,
        recommendator: recommendator_data,
        roledata,
        jamdata,
        is_vote,
        picturedata
    }

    res.status(200).json(obj as GameResponse);
}

export default getGameById;
