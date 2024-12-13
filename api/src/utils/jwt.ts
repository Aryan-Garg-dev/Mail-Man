import jwt from 'jsonwebtoken';
import envs from "../constant"
import errors, { MailManError } from './errors';

export const generateAppTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, envs.JWT_SECRET!, { expiresIn: '12h' });
  const refreshToken = jwt.sign({ userId }, envs.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' }); 
  return { accessToken, refreshToken };
};

export const verifyAppToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, envs.JWT_SECRET!) as jwt.JwtPayload;
    if (!decoded.userId) throw new MailManError(400, "INVALID_TOKEN", "Token payload is missing userId");
    return decoded.userId;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError){
      throw errors.TokenExpiredError();
    }
    throw errors.TokenVerificationFailedError();
  }
}

export const refreshAppTokens = (appRefreshToken: string)=>{
  try {
    const decoded = jwt.verify(appRefreshToken, envs.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;
    const userId = decoded.userId;
    const { accessToken, refreshToken } = generateAppTokens(userId);
    return { accessToken, refreshToken };
  } catch(error){
    if (error instanceof jwt.TokenExpiredError) {
      throw errors.TokenExpiredError("Token has expired. Please log in again.")
    } 
    throw errors.TokenVerificationFailedError();
  }
}