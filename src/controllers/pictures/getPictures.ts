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
  const count = Number(req?.query?.count || per_page);

  // Search on games:
  if (query_search) {
      const [ ids, total ] = await search("pictures", query_search, offset, count);
      const items = [];
      for (const id of ids) {
          const data = await getPicture(Number(id));
          items.push(data);
      }

      res.status(200).json({
          items,
          offset,
          limit: count,
          total
      });
      return;
  }

  const { hits } = await es.search({
    index: "pictures",
    from: offset,
    size: count,
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
    limit: count,
    total: hits?.total?.value
  });
}

export default getPictures;