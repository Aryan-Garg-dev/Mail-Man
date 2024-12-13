import MailModel from "../../models/mail.model"

type MailRecord = { reciever: string, html: string, subject: string };

export class RecordDB {
  static async saveRecord(senderId: string, record: MailRecord, success: boolean){
    try {
      await MailModel.create({
        sender: senderId,
        reciever: record.reciever,
        body: record.html,
        subject: record.subject,
        success,
      })
    } catch (error) {
      console.error(`Error saving record: ${(error as Error).message}`)
    }
  }
}