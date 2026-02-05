import { Client } from "@elastic/elasticsearch";

const es = new Client({
    node: "http://localhost:9200",
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