export default interface Game {
    /** ID игры */
    id?: number;
    /** Название игры */
    title: string;
    /** Версия игры */
    version: string;
    /** Описание игры */
    description: string;
    /** Теги */
    tags: strings[];
    /** Статус игры */
    status: "draft" | "public" | "private";
    /** Кто опубликовал игру */
    creater_id: number;
    /** Соавторы */
    authors?: number[];
    /** Для какого джема игра */
    jam_id?: number;
    /** Дата создания */
    date_created?: string;
    /** Дата изменения */
    date_updated?: string;
}