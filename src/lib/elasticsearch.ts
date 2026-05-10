import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const REQUEST_TIMEOUT_MS = 5_000;

const es = new Client({
    node: process.env.ES_URL,
    requestTimeout: REQUEST_TIMEOUT_MS,
    maxRetries: 3
});

export const initES = async () => {
    try {
        const { name, version } = await es.info();
        console.log(`[elasticsearch] connected to ${name} (${version.build_type})`);
        
        return true;
    }
    catch(err) {
        console.log(err);
    }
}

export default es;