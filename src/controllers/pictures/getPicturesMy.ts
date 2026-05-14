import { getComments } from "@/services/comments";
import { getLikesByInstance } from "@/services/likes";
import { getPicture, getPictures } from "@/services/pictures";
import Picture from "@/types/picture";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get all pictures by author
 * @param req - Request
 * @param res - Response
*/
const getPicturesMy = async (req: Request, res: Response): Promise<void> => {
  const offset: number = req.query.offset && Number(req.query.offset);
  const limit: number = req.query.limit && Number(req.query.limit);
  const status: string = req.query?.status && String(req.query.status) || undefined;
  const search: string = req.query?.search && String(req.query.search) || undefined;
  const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");

  const [ ids, total ] = await getPictures(
    offset,
    limit,
    search,
    Number(req?.user_id),
    sort,
    status
  );

    const items: Picture[] = [];
    for (const id of ids) {
        const picture = await getPicture(Number(id));
        const likes = await getLikesByInstance(Number(id), "picture");
        const [ _, comments ] = await getComments(Number(id), 0, 1, "picture");
        items.push({
            ...picture,
            likes,
            comments
        });
    }

    res.status(200).json({
        items,
        offset,
        limit,
        total
    });
}

export default getPicturesMy;