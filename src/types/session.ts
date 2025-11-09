export default interface Session {
    /** ID */
    id: number;
    /** IP адрес сессии */
    ip: string;
    /** Браузер, версия ОС */
    user_agent: string;
    /** Дата создания */
    date_created: string;
    /** Дата завершения */
    date_expires: string;
    /** Токен доступа */
    token?: string;
}