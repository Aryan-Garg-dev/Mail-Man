import { Queue } from "bullmq"
import redisClient from "../Storage/redis-store.service";
import { User } from "../../models/user.model";


const mailingQueue = new Queue('mailingQueue', { connection: redisClient });

mailingQueue.on('waiting', (job) => {
  console.log(`send-mail: JobId: ${job.id} (UserId: ${job.data.user._id}) is waiting to be processed`);
})

mailingQueue.on('error', (error) => {
  console.error(`send-mail: Error in mailingQueue: ${(error as Error).message}`);
})

mailingQueue.on('progress', (job, progress) => {
  console.log(`send-mail: Job with id ${job.id} (UserId: ${job.data.user._id}) is ${progress}% complete.`);
});

export type MailData = { from: string, subject: string }
export type MailQueueData = { mailData: MailData, user: User };
const addToQueue = async (data: MailQueueData) => {
  await mailingQueue.add('send-mail', data, {
    attempts: 3,
    removeOnComplete: true,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnFail: true,
  });
}

const MailingQueue = {
  queue: mailingQueue,
  add: addToQueue
}

export default MailingQueue;