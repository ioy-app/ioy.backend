import IdSchema from "@schemas/id";
import UserControlsSchema from "@schemas/userControls";
import { UserController } from "@/types/user";
import validate from "@utils/validate";
import db from "@lib/db";
import redisClient from "@lib/redis";
import { checkSubscribe } from "../subscribers";

/**
 * Пользовательские кнопки упарвления:
 * Подписаться, редактировать и т.д.
 * 
 * @param source_id - Источник 
 * @param target_id - Цель
 * @returns
*/
const getUserControls = async (source_id: number, target_id: number): Promise<UserController> => {
    validate(IdSchema, source_id, "getUserControls");
    validate(IdSchema, target_id, "getUserControls");

    const controls: UserController = {
        is_subscribe: await checkSubscribe(source_id, target_id, "user"),
        is_me: Boolean(target_id == source_id)
    }

    return controls;
}

export default getUserControls;