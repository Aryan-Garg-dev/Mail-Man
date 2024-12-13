import nodemailer, { Transporter } from "nodemailer"
import envs, { time } from "../../constant";
import { MailOptions } from "nodemailer/lib/json-transport";
import { User } from "../../models/user.model";
import { GoogleOAuth } from "../Auth/google-auth.service";
import { UserDB } from "../../db/User/user.db";

export class Mailer {
  private mailTransporter: Transporter;
  private userEmailId: string;
  private userRefreshToken: string;
  private userAccessToken: string;
  private tokenExpirationDate: Date;

  private static readonly TOKEN_REFRESH_GRACE_PERIOD_MS = 30 * time.SECONDS;

  constructor(
    user: User
  ){
    this.userEmailId = user.email;
    this.userRefreshToken = user.oauth.refreshToken;
    this.userAccessToken = user.oauth.accessToken;
    this.tokenExpirationDate = user.oauth.expiryDate;
    console.log(this.userEmailId, this.userAccessToken, this.userRefreshToken)
    this.mailTransporter = this.createTransporter();
  }

  private createTransporter = ():Transporter =>{
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: this.userEmailId,
        clientId: envs.GOOGLE_CLIENT_ID,
        clientSecret: envs.GOOGLE_CLIENT_SECRET,
        refreshToken: this.userRefreshToken,
        accessToken: this.userAccessToken,
      },
      logger: true,
      debug: true,
    })
  }

  private refreshAccessTokenIfExpired = async () => {
    if (Date.now() < new Date(this.tokenExpirationDate).getTime() - Mailer.TOKEN_REFRESH_GRACE_PERIOD_MS) return;
    try {
      const googleOAuth = new GoogleOAuth();
      const tokens = await googleOAuth.getNewAccessToken(this.userRefreshToken)
      const { access_token, refresh_token, expiry_date } = tokens;
      if (!access_token || !refresh_token || !expiry_date) throw new Error("Failed to get tokens from Google OAuth.");
      
      await UserDB.updateOAuthTokens(this.userEmailId, {
        access_token, refresh_token, expiry_date
      })

      this.userAccessToken = access_token;
      this.userRefreshToken = refresh_token;
      this.tokenExpirationDate = new Date(expiry_date);
      this.mailTransporter = this.createTransporter();
    } catch(error){
      console.log(`Failed to refresh access token for user ${this.userEmailId}: ${(error as Error).message}`);
      throw new Error("Unable to refresh access token");
    }
  }

  sendMail = async (username: string, to: string, subject: string, htmlContent: string, from?: string)=>{
    const mailOptions: MailOptions = {
      from: { name: username, address: from || this.userEmailId },
      to,
      subject,
      html: htmlContent.replace(/"/g, ""),
    }
    try {
      await this.refreshAccessTokenIfExpired();
      const info = await this.mailTransporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error("Error sending email: ", error);
      throw new Error(`Failed to send email to ${to}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}