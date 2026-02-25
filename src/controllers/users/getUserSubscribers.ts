import getUserSubs from "@/services/subscribers/getUserSubs";
import getUser from "@/services/users/getUser";
import getUserId from "@/services/users/getUserId";
import getUserLogin from "@/services/users/getUserLogin";
import { User } from "@/types/user";
import { Request, Response } from "express";

/**
 * Получение списка подписок на других пользователей
 * 
 * @param req - Запрос 
 * @param res - Ответ 
*/
const getUserSubscribers = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;
    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);
    const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");

    const user = await getUser(login);
    if (!user?.privacy?.subscribers) {
        res.status(200).json({
            items: [],
            offset,
            limit,
            total: 0
        });
        return;
    }

    const id = await getUserId(login);
    const [ items, total ] = await getUserSubs(id, "user", offset, limit, sort);
    const data: User[] = [];
    for (const id of items) {
        const user_login = await getUserLogin(id);
        const user_data = await getUser(user_login);
        data.push(user_data);
    }
    
    res.status(200).json({
        items: data,
        offset,
        limit,
        total
    });
}

export default getUserSubscribers;