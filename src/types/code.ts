export default interface Code {
    /** ID кода */
    id?: number;
    /** Код активации */
    code: string;
    /** Нагрузка */
    payload?: Record<string, unknown>;
    /** Время создания */
    date_created?: string;
    /** ID пользователя */
    uid: number;
}