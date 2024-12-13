import "dotenv/config"
import { CookieOptions } from "express";

const { 
  NODE_ENV,
  PORT,
  MONGO_DB_URI,

  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URI,
  AUTH_REDIRECT_URI,

  JWT_SECRET,
  REFRESH_TOKEN_SECRET,

  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
} = process.env;

const envs = {
  NODE_ENV, PORT, MONGO_DB_URI, 
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URI, AUTH_REDIRECT_URI,
  JWT_SECRET, REFRESH_TOKEN_SECRET,
  REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
}

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://mail.google.com/'
]

export const size = {
  KB: 1024,//bytes
  MB: 1024 * 1024 // bytes
}

export const time = {
  SECONDS: 1000, //ms
  MINUTES: 60 * 1000, //ms
  HOUR: 60 * 60 * 1000
}

export const cookieOptions : CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV !== 'development',
  sameSite: 'lax',
  maxAge: 12 * 60 * 60 * 1000,
}

export default envs;