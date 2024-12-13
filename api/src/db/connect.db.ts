import mongoose from 'mongoose';

import envs from '../constant';
import { AppError } from '../utils/errors';

const MONGO_DB_URI = envs.MONGO_DB_URI;

export const connectDB = async (): Promise<void | AppError> => {
  try {
    if (!MONGO_DB_URI) {
      console.error("Failed to connect to db: Missing MongoDB URI");
      process.exit(1);
    }
    const connection = await mongoose.connect(MONGO_DB_URI);
    console.log(`Successfully connected to database`);
    console.log(`DB-NAME: ${connection.connection.name}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};