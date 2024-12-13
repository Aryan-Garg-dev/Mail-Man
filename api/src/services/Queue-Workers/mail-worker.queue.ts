import { Worker, Job } from "bullmq";
import redisClient, { redisActions } from "../Storage/redis-store.service";  
import { MailData, MailQueueData } from "../Queues/mail.queue";
import { decompressorPath, runWorker, templateParserPath } from "../../workers";
import { parseTemplate } from "../../utils/parse/html-template";
import { Mailer } from "../Mail/mailer.service";
import { delay } from "../../utils/delay";
import { RecordDB } from "../../db/Records/records.db";
import { decompress } from "../../utils/file";
import zlib from 'zlib';

const mailWorkerHandler = async (job: Job) => {
  const { mailData, user } = job.data as MailQueueData;
  const { from, subject } = mailData as MailData;

  // <---Tasks Executed--->
  // decompress html template, csv data in separate worker thread
  // create a mailer instance
  // parse template for every field of csv data or create an array of promises
  // send mail with delay 0.5-1 sec for every reciepient from csv data
  // save record of the mails being sent in mongoDB

  try {
    const compressedHTMLTemplate = await redisActions.get(`template:${user._id}`);
    if (!compressedHTMLTemplate) throw new Error("HTML template is missing");

    const HTMLTemplate = await runWorker(decompressorPath, { 
      data: compressedHTMLTemplate
    })

    const compressedCSVData = await redisActions.get(`csv:${user._id}`);
    if (!compressedCSVData) return new Error("CSV Data is missing");

    const parsedCSVData = await runWorker(decompressorPath, {
      data: compressedCSVData
    })
    const CSVData = JSON.parse(parsedCSVData.toString())

    const mailData = [];
    for (const row of CSVData){
      try {
        const HTMLContent = await runWorker(templateParserPath, { 
          htmlTemplate: HTMLTemplate, 
          rowData: row
        })
        const parsedSubject = parseTemplate(subject, row);
        mailData.push({
          from,
          to: row.recipient, //! [RECIPIENT]
          html: HTMLContent,
          subject: parsedSubject,
        })
      } catch(error){
        console.error(`Error processing email for ${row.recipient || "unknown"}: ${(error as Error).message}`);
        throw error;
      }
    }

    const mailer = new Mailer(user);
    for (const mail of mailData){
      let success = true;
      try {
        await mailer.sendMail(user.name, mail.to, mail.subject, mail.html);
        await delay(500 + Math.random() * 500);
      } catch(error){
        success = false;
        console.error(`Error sending email to ${mail.to}: ${(error as Error).message}`); // Error emittion
      } finally {
        await RecordDB.saveRecord(user._id.toString(), {
          reciever: mail.to,
          subject: mail.subject,
          html: mail.html
        }, success)
      }
    }
  } catch(error){
    console.error(`Error in mailWorkerHandler: ${(error as Error).message}`);
    throw error;
  }
}

const mailWorker = new Worker("mailingQueue", mailWorkerHandler, { connection: redisClient });

mailWorker.on('completed', (job: Job, result)=>{
  console.log(`Mail: Job with id ${job.id} (UserId: ${job.data.user._id}) has been completed.`);
})

mailWorker.on('failed', (job, error) => {
  console.error(`Mail: Job with id ${job?.id} failed: ${(error as Error).message}`);
});

export default mailWorker;