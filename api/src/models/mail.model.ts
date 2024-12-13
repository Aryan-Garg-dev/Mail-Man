import { Schema, model, Document, Types } from "mongoose";

interface Mail extends Document {
  _id: Types.ObjectId,
  sender: Types.ObjectId,
  reciever: string,
  subject: string,
  body: string,
  success: boolean,
  createdAt: Date,
  updatedAt: Date 
}

const mailSchema = new Schema<Mail>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reciever: { type: String, required: true },
  subject:{ type: String, required: true },
  body: { type: String, required: true },
  success: { type: Boolean, required: true }
}, { timestamps: true });

const MailModel = model<Mail>("Mail", mailSchema);

export default MailModel;