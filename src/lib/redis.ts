import { Cluster } from "ioredis";

const CACHE_TTL: number = 600;
const cluster = new Cluster([
    { host: "127.0.0.1", port: 7001 },
    { host: "127.0.0.1", port: 7002 },
    { host: "127.0.0.1", port: 7003 },
    { host: "127.0.0.1", port: 7004 },
    { host: "127.0.0.1", port: 7005 },
    { host: "127.0.0.1", port: 7006 }
], {
    natMap: {
        '172.28.0.101:7000': { host: '127.0.0.1', port: 7001 },
        '172.28.0.102:7000': { host: '127.0.0.1', port: 7002 },
        '172.28.0.103:7000': { host: '127.0.0.1', port: 7003 },
        '172.28.0.104:7000': { host: '127.0.0.1', port: 7004 },
        '172.28.0.105:7000': { host: '127.0.0.1', port: 7005 },
        '172.28.0.106:7000': { host: '127.0.0.1', port: 7006 }
    },
    clusterRetryStrategy: (times) => {
        const delay = Math.min(1000 + times * 500, 10000);
        console.log(`[redis] Retry attempt #${times}, delay: ${delay}ms`);
        return delay;
    },
    retryDelayOnClusterDown: 100,
    scaleReads: "slave",
    enableAutoPipelining: true,
    slotsRefreshInterval: 500,
    slotsRefreshTimeout: 2000
});

cluster.on('connect', () => console.log('[redis] connect'));
cluster.on('ready', () => console.log('[redis] ready'));
cluster.on('close', () => console.log('[redis] close'));
cluster.on('error', (err) => console.error('[redis] error:', err.message));
cluster.on('end', () => console.error('[redis] connection ended'));
cluster.on('node error', (err, options) =>
  console.error(`[redis] node error (${options.host}:${options.port}):`, err.message)
);
cluster.on('cluster error', (err) => {
  console.error('[CLUSTER ERROR]', err);
});

const isReady = () => cluster.status == "ready";
interface CustomClient extends RedisClientType {
    readWithLog: (key: string) => Promise<string>;
    writeWithLog: (key: string, data: string) => void;
    delWithLog: (key: string) => Promise<void>;
    delAllWithLog: (key: string, batchSize?: number) => Promise<number>;
}

const redis: CustomClient = cluster;

/**
 * Чтение данных из кеша
 * 
 * @param {string} key Ключ 
 * @returns {Promise<string>}
*/
redis.readWithLog = async (key: string): Promise<string> => {
    let cache: string;
    if (!isReady())
        return cache;

    try { cache = await cluster.get(key); }
    catch (err) {
        console.log("[redis, read]", err);
        cluster.disconnect();
    }

    return cache;
}

/**
 * Запись данных в кеш
 * 
 * @param {string} key Ключ 
 * @param {string} data Данные (Обязательно в виде текста)
 * @returns {void}
 */
redis.writeWithLog = (key: string, data: string): void => {
    if (!isReady())
        return;

    try { cluster.set(key, data, "EX", CACHE_TTL); }
    catch(err) {
        console.log("[redis, write]", err);
        cluster.disconnect();
    }
}

/**
 * Удаление данных из кеша
 * 
 * @param {string} key Ключ 
 * @returns {Promise<void>}
*/
redis.delWithLog = async (key: string): Promise<void> => {
    if (!isReady())
        return;
    try { await cluster.del(key); }
    catch(err) {
        console.log("[redis, del]", err);
        cluster.disconnect();
    }
}

/**
 * Удаление данных по паттерну из кеша
 * 
 * @param {string} key Ключ
 * @param {number} [batchSize=1000] Размер пачки
 * @returns 
*/
redis.delAllWithLog = async (key: string, batchSize=1000): Promise<number> => {
    let cursor: string = '0';
    let totalDeleted: number = 0;

    do {
        const [ nextCursor, keys ] = await cluster.scan(cursor, "MATCH", key, "COUNT", batchSize.toString());
        cursor = nextCursor;

        if (keys.length > 0) {
            const deletedCount = await cluster.del(keys);
            totalDeleted += deletedCount;
        }
    } while (cursor !== '0');

    return totalDeleted;
}



export default redis;