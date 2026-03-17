import checkLikeByGame from "@/services/likes/checkLikeByGame";
import createLike from "@/services/likes/createLike";
import deleteLike from "@/services/likes/deleteLike";
import Request from "@/types/request";
import { Response } from "express";

const postGameLike = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const is_like = await checkLikeByGame(Number(req.user_id), Number(id));
    let status: string;
    if (is_like) {
        await deleteLike(Number(req.user_id), Number(id), "game");
        status = "dislike";
    } else {
        await createLike(Number(req.user_id), Number(id), "game");
        status = "liked";
    }
    
    res.status(200).json({ status });
}

export default postGameLike;