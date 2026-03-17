import {
    Request as ExpressRequest,
} from "express";

type Request = ExpressRequest & {
    /** ID Пользователя */
    user_id: number;
    /** Доступ к маршруту */
    is_access: boolean;
    /** ID сессии */
    refresh_id: number;
    /** Refresh токен */
    token?: string;
}

export default Request;