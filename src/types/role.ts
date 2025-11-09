export default interface Role {
    /** ID */
    id?: number;
    /** Название роли */
    title?: string;
    /** Возможность банить */
    is_ban?: boolean;
    /** Предупреждение играм */
    is_warning_games?: boolean;
    /** Предупреждение пользователям */
    is_warning_users?: boolean;
    /** Предупреждение комментарию */
    is_warning_comments?: boolean;
    /** Предупреждение джему */
    is_warning_jams?: boolean;
    /** Удаление игры */
    is_delete_games?: boolean;
    /** Удаление пользователя */
    is_delete_users?: boolean;
    /** Удаление комментария */
    is_delete_comments?: boolean;
    /** Удаление джема */
    is_delete_jams?: boolean;
    /** Дата создания */
    date_created?: string;
}