export interface Description {
    /** Тип описания */
    type: string;
    /** Содержание */
    content: string;
}

export interface UserSimple {
    /** ID */
    id: number;
    /** Логин */
    login: string;
    /** Дата создания */
    date_created: string;
    /** Дата бана */
    date_ban: string;
    /** Дата последнего входа */
    date_last_login: string;
    /** Роль */
    role_id: number;
    /** Почта пользователя */
    email?: string;
}

export interface User extends UserSimple {
    /** Описание */
    description?: Description[];
    /** Кол-во подписчиков */
    subscribers: number;
}

export interface UserDetails extends User {
    /** Настройки приватности */
    privacy: {
        /** Сохраненные игры */
        favorites?: boolean;
        /** Собственные игры */
        games?: boolean;
        /** Понравилось */
        likes?: boolean;
        /** Подписки на других авторов */
        subscribers?: boolean;
    }
    /** Кол-во банов */
    ban_count: number;
    /** Активен ли пользователь */
    active?: boolean;
    /** Панель управления */
    controls?: UserController;
    /** Есть ли файл аватарки */
    is_avatar?: boolean;
}

export interface UserController {
    /** Активная подписка */
    is_subscribe: boolean;
    /** Пользовать является собой */
    is_me: boolean;
}