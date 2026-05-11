import { checkLikeByInstance } from "@/services/likes";
import createLike from "@/services/likes/createLike";
import deleteLike from "@/services/likes/deleteLike";
import Request from "@/types/request";
import { Response } from "express";

const postPictureLike = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const is_like = await checkLikeByInstance(Number(req.user_id), Number(id), "picture");
    let status: string;
    if (is_like) {
        await deleteLike(Number(req.user_id), Number(id), "picture");
        status = "dislike";
    } else {
        await createLike(Number(req.user_id), Number(id), "picture");
        status = "liked";
    }
    
    res.status(200).json({ status });
}

export default postPictureLike;