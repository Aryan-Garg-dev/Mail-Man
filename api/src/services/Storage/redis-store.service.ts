import Redis, { RedisOptions } from "ioredis"
import envs from "../../constant"
import { decompress } from "../../utils/file"

const redisConfig: RedisOptions = {
  host: envs.REDIS_HOST,
  port: Number(envs.REDIS_PORT),
  password: envs.REDIS_PASSWORD,
  username: "default",
  db: 0,
  maxRetriesPerRequest: null
}

const redisClient = new Redis(redisConfig)

export const redisActions = {
  get: async (key: string) => {
    return await redisClient.get(key)
  },
  set: async (key: string, data: string | object | number) => {
    return await redisClient.set(key, JSON.stringify(data), 'EX', 86400)
  },
  del: async (key: string) => {
    return await redisClient.del(key)
  }
}

export async function trackEmailsSent(userId: string) {
  const emailsSentKey = `emailsSent:${userId}`;
  const csvKey = `csv:${userId}`;
  const limit = 500;

  try {
    const emailsSent = await redisActions.get(emailsSentKey);
    const emailsCount = emailsSent ? parseInt(emailsSent) : 0;

    if (emailsCount >= limit) return false;

    const csvData = await redisActions.get(csvKey);
    if (!csvData) return true; 

    const parsedCSVData = JSON.parse(decompress(Buffer.from(csvData)));
    const emailsToSend = parsedCSVData.length;

    if (emailsCount + emailsToSend > limit) return false;
    
    await redisClient.set(emailsSentKey, emailsCount + emailsToSend, 'EX', 86400);

    return true; 
  } catch (error) {
    console.error(`Error tracking emails sent: ${(error as Error).message}`);
    return false; 
  }
}

redisClient.on('connect', () => {
  console.log('Connected to external Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});


export default redisClient;
