import { GoogleOAuth } from "../services/Auth/google-auth.service";
import { Request, Response, NextFunction } from "express";
import errors from "../utils/errors";
import envs, { cookieOptions } from "../constant";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/bcrypt";
import { generateAppTokens } from "../utils/jwt";


const googleOAuth = new GoogleOAuth()

const redirectToGoogleAuth = (req: Request, res: Response, next: NextFunction)=>{
  try {
    const authUrl = googleOAuth.getAuthURL();
    res.redirect(authUrl);
  } catch (error) {
    next(errors.OAuthError("Failed to generate Google authentication URL"));
  }
}

const registerUser = async (req: Request, res: Response, next: NextFunction)=>{
  const code = req.query.code;
  if (typeof code !== 'string') {
    return next(errors.Forbidden('Authorization code is missing.'))
  }
  
  try {
    const { access_token, refresh_token, expiry_date } = await googleOAuth.getTokens(code);
    console.log(access_token, refresh_token)
    if (!access_token || !refresh_token) {
      throw errors.OAuthError("Failed to retrieve tokens from Google.");
    }

    const userInfo = await googleOAuth.getUserInfo(access_token!);

    const { email, name, image } = userInfo;
    if (!email || !name) {
      throw errors.OAuthError("Failed to retrieve user information from Google.");
    }

    let user = await UserModel.findOne({ email })

    if (!user){
      user = await UserModel.create({  
        name, email, image,
        oauth: {
          accessToken: access_token!,
          refreshToken: refresh_token!,
          expiryDate: new Date(expiry_date!)
        }
      })
    }

    const { accessToken, refreshToken } = generateAppTokens(user._id.toString());

    user.appRefreshToken = refreshToken;
    user.oauth.accessToken = access_token;
    user.oauth.refreshToken = refresh_token;
    await user.save();

    res.cookie("token", accessToken, cookieOptions);

    if (envs.NODE_ENV !== "development") {
      res.redirect(envs.AUTH_REDIRECT_URI!);
      return;
    }

    res.status(201).json({ 
      user: { name, email, image },
      success: true,
      message:  user.isNew ? "User created successfully": "User logged in successfully",
    })
  } catch(error){
    next(errors.OAuthError("Internal Server Error"))
  }
}

const checkAuth = (req: Request, res: Response, next: NextFunction)=>{
  try {
    const user = req.user;
    if (!user) return next(errors.Unauthorized());
    res.status(200).json({ 
      name: user.name, 
      email: user.email, 
      image: user.image 
    });
  } catch(error){
    return next(errors.InternalServerError());
  }
}

const logout = (req: Request, res: Response, next: NextFunction)=>{
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully", success: true });
  } catch(error){
    return next(errors.InternalServerError());
  }
}

const AuthController = {
  logout,
  checkAuth,
  redirectToGoogleAuth,
  registerUser
} 

export default AuthController;

