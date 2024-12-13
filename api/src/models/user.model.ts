import { Schema, model, Document, Types } from "mongoose";

export interface User extends Document {
  _id: Types.ObjectId,
  name: string,
  image: string
  email: string,
  oauth: { 
    accessToken: string, 
    refreshToken: string, 
    expiryDate: Date 
  }
  appRefreshToken?: string, 
  createdAt: Date,
  updatedAt: Date,
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  image: { type: String },
  email: { type: String, required: true, unique: true },
  oauth: {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiryDate: { type: Date, required: true },
  },
  appRefreshToken: { type: String }
}, { timestamps: true });

const UserModel = model<User>("User", userSchema);

export default UserModel;