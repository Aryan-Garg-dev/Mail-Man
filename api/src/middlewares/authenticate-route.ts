import { NextFunction, Request, Response } from "express";
import errors, { MailManError } from "../utils/errors";
import { refreshAppTokens, verifyAppToken } from "../utils/jwt";
import UserModel from "../models/user.model";
import jwt from 'jsonwebtoken';
import { cookieOptions } from "../constant";

export const authenticated = async (req: Request, res: Response, next: NextFunction)=>{
  const token = req.cookies.token;
  if (!token) return next(errors.Unauthorized("Token not provided"));
  try {
    const userId = verifyAppToken(token);
    const user = await UserModel.findById(userId);
    if (!user) return next(new MailManError(404, "USER_NOT_FOUND", "User could not be found"))
    req.user = user;
    next();
  } catch(error){
    if (error instanceof MailManError && error.code === "TOKEN_EXPIRED"){
      return refreshTokens(req, res, next);
    }
    return next(errors.TokenVerificationFailedError());
  }
}

const refreshTokens = async (req: Request, res: Response, next: NextFunction)=>{
  const token = req.cookies.token;
  const tokenPayload = jwt.decode(token) as jwt.JwtPayload;
  if (!tokenPayload || !tokenPayload.userId) {
    return next(new MailManError(400, "INVALID_TOKEN", "Invalid token payload"));
  }
  const userId = tokenPayload.userId;
  
  const user = await UserModel.findById(userId);
  if (!user) return next(new MailManError(404, "USER_NOT_FOUND", "User could not be found"))
  
  const appRefreshToken = user.appRefreshToken;
  if (!appRefreshToken) return next(new MailManError(401, "REFRESH_TOKEN_MISSING", "Refresh token is missing. Please log in again."));

  try {
    const { accessToken, refreshToken } = refreshAppTokens(appRefreshToken);
    user.appRefreshToken = refreshToken;
    await user.save();
    
    res.cookie('token', accessToken, cookieOptions);
    
    req.user = user;
    return next();
  } catch(error){
    return next(errors.TokenExpiredError("Refresh token is invalid or expired. Please log in again."))
  }
} 