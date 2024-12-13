import { Queue } from "bullmq"
import redisClient from "../Storage/redis-store.service";

const csvQueue = new Queue('csvQueue', { connection: redisClient });

//TODO: QueueEvents (for real time events via sockets)

csvQueue.on('waiting', (job) => {
  console.log(`process-csv: JobId: ${job.id} (UserId: ${job.data.userId}) is waiting to be processed`);
})

csvQueue.on('error', (error) => {
  console.error(`process-csv: Error in csvQueue: ${(error as Error).message}`);
})

csvQueue.on('progress', (job, progress) => {
  console.log(`process-csv: Job with id ${job.id} (UserId: ${job.data.userId}) is ${progress}% complete.`);
});

export type CSVQueueData = { fileName: string, filePath: string, userId: string }
const addToQueue = async(data: CSVQueueData)=>{
  await csvQueue.add('process-csv', data, {
    attempts: 3,
    removeOnComplete: true,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnFail: true
  });
}

const CSVQueue = {
  queue: csvQueue,
  add: addToQueue
}

export default CSVQueue;

