import { Worker, Job } from "bullmq";
import redisClient, { redisActions } from "../Storage/redis-store.service";
import { decompress, deleteFile, readFile } from "../../utils/file";
import { compressorPath, csvParserPath, runWorker } from "../../workers";
import { CSVQueueData } from "../Queues/csv.queue";

const csvWorkerHandler = async (job: Job) => {
  const { filePath, userId } = job.data as CSVQueueData;
  try {
    const parsedCSVData = await runWorker(csvParserPath, { filePath });
    const compressedCSVData = await runWorker(compressorPath, { data: parsedCSVData });
    await redisActions.set(`csv:${userId}`, compressedCSVData);
    console.log(`Data stored in Redis for UserId: ${userId}`);        
    await deleteFile(filePath);
  } catch (error){
    console.error(`Error in csvWorkerHandler: ${(error as Error).message}`);
    await job.moveToFailed(error as Error, job.token as string, true);
  }
} 

const csvWorker = new Worker('csvQueue', csvWorkerHandler, { connection: redisClient });

csvWorker.on('completed', (job: Job, result)=>{
  console.log(`CSV: Job with id ${job.id} (UserId: ${job.data.userId}) has been completed.`);
})

csvWorker.on('failed', (job, error) => {
  console.error(`CSV: Job with id ${job?.id} failed: ${(error as Error).message}`);
});

export default csvWorker;
