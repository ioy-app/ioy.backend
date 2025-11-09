import {
    Request as ExpressRequest,
} from "express";

export default interface Request extends ExpressRequest {
    /** ID Пользователя */
    user_id: number;
    /** Доступ к маршруту */
    is_access: boolean;
    /** ID сессии */
    refresh_id: number;
    /** Refresh токен */
    token?: string;
}