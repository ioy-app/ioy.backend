import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.AI_TOKEN,
  baseURL: process.env.AI_URL
});


export default client;