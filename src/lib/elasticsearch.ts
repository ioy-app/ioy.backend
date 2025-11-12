import { Client } from "@elastic/elasticsearch";

const es = new Client({
    node: "http://localhost:9200"
});

es.info().then(({ name, version }) => console.log(`[elasticsearch] connected to ${name} (${version.build_type})`));

export default es;