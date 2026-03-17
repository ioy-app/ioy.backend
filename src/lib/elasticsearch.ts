import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const es = new Client({
    node: process.env.ES_URL,
    requestTimeout: 5000,
    sniffOnStart: false,
    sniffOnConnectionError: false
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

async function test() {
  await initES();

  try {
    const res = await es.index({
      index: "test",
      document: { hello: "world" },
    });
    console.log("result:", res);
  } catch (err) {
    console.error("error:", err.message);
  }
}

test();

export default es;