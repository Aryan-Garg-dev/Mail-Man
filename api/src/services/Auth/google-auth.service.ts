import { OAuth2Client } from "google-auth-library";
import { SCOPES } from "../../constant";
import envs from "../../constant";

type UserInfoResponseData = { name: string, email: string, picture: string };

export class GoogleOAuth {
  private getOAuthClient = ()=>{
    return new OAuth2Client(
      envs.GOOGLE_CLIENT_ID,
      envs.GOOGLE_CLIENT_SECRET,
      envs.GOOGLE_CALLBACK_URI
    )
  }

  // Generates the google OAuth2.0 authorization URL
  getAuthURL = (scopes: string[] = SCOPES): string =>{
    const oauthClient = this.getOAuthClient();
    return oauthClient.generateAuthUrl({
      access_type: 'offline',
      // refresh_token does not expire
      // access_token expires every hour
      scope: scopes,
      prompt: 'consent'
      // every time user log in, consent screen comes
      // fresh refresh is recieved after every login
    });
  }

  // Fetch User info using the current OAuth credentials
  getUserInfo = async (ACCESS_TOKEN: string) =>{
    const oauthClient = this.getOAuthClient();
    oauthClient.setCredentials({ access_token: ACCESS_TOKEN });
    try {
      const userInfoResponse = await oauthClient.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo'
      });
      const { name, email, picture } = userInfoResponse.data as UserInfoResponseData;
      return { name, email, image: picture };
    } catch(error){
      throw new Error(`Failed to fetch user info: ${(error as Error).message}`);
    }
  }

  // Excahnges the authorization code for access and refresh tokens
  getTokens = async (AUTH_CODE: string)=>{
    const oauthClient = this.getOAuthClient();
    try {
      const { tokens } = await oauthClient.getToken(AUTH_CODE);
      oauthClient.setCredentials(tokens);
      const { access_token, refresh_token, expiry_date } = tokens;
      return { access_token, refresh_token, expiry_date };
    } catch(error){
      throw new Error(`Failed to get tokens: ${(error as Error).message}`)
    }
  }
  // Refreshes the access token using the refresh token
  getNewAccessToken = async (REFRESH_TOKEN: string) => {
    const oauthClient = this.getOAuthClient();
    oauthClient.setCredentials({ refresh_token: REFRESH_TOKEN })
    try {
      const newToken = await oauthClient.getAccessToken();
      return { 
        access_token: newToken.token, 
        refresh_token: oauthClient.credentials.refresh_token,
        expiry_date: oauthClient.credentials.expiry_date  
      };
    } catch(error){
      throw new Error(`Failed to refresh access token: ${(error as Error).message}`);
    }
  }
}




