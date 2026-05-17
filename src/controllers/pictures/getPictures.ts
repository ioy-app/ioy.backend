import es from "@/lib/elasticsearch";
import { getPicture } from "@/services/pictures";
import { search } from "@/services/search";
import { Request, Response } from "express";

const per_page = 10;

/**
 * Get pictures global
 * @param req - Request
 * @param res - Response
*/
const getPictures = async(req: Request, res: Response): Promise<void> => {
  const offset = Number(req?.query?.offset || 0)
  const query_search: string = req.query.search && String(req.query.search);

  // Search on games:
  if (query_search) {
      const [ ids, total ] = await search("pictures", query_search, offset, per_page);
      const items = [];
      for (const id of ids) {
          const data = await getPicture(Number(id));
          items.push(data);
      }

      res.status(200).json({
          items,
          offset,
          limit: per_page,
          total
      });
      return;
  }

  const { hits } = await es.search({
    index: "pictures",
    from: offset,
    size: per_page,
    sort: [
      { date_created: { order: "desc" } }
    ]
  });

  const pictures = [];
  for (const picture of hits?.hits || []) {
    const data = await getPicture(Number(picture?._id));
    pictures.push(data);
  }

  res.status(200).json({
    items: pictures,
    offset,
    limit: per_page,
    total: hits?.total?.value
  });
}

export default getPictures;