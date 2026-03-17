import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
    clientId: "ioy.app",
    brokers: [ process.env.KAFKA_BROKER ]
});

export default kafka;