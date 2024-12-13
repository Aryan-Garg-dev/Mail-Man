import UserModel from "../../models/user.model";

type Tokens = { access_token: string, refresh_token: string, expiry_date: Number }

export class UserDB {
  static async updateOAuthTokens(
    emailId: string,
    tokens: Tokens
  ) {
    const user = await UserModel.findOne({ email: emailId });
    if (!user) throw new Error("user not found.");
    user.oauth.accessToken = tokens.access_token;
    user.oauth.refreshToken = tokens.refresh_token;
    user.oauth.expiryDate = new Date(tokens.expiry_date as number);
    await user.save();
  }
}