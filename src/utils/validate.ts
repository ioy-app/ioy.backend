import { ZodError, ZodType } from "zod";
import ValidError from "./ValidError";

/**
 * Валидация входящих данных
 * 
 * @param {ZodSchema} schema Схема проверки данных 
 * @param {unknown} data Данные для проверки 
 * @param {string} component Название компонента, в котором произошла ошибка
*/
const validate = <T>(schema: ZodType, data: unknown, component?: string) => {
    try { schema.parse(data); }
    catch(err) {
        if (err instanceof ZodError)
            throw new ValidError(component, err.issues[0].message);
        throw err;
    }
}

export default validate;