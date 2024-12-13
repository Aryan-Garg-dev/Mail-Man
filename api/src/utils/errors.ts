import createError, { HttpError } from 'http-errors'

export class MailManError extends Error{
  public status: number;
  public code: string;
  constructor(status: number, code: string, message: string){
    super(message);
    this.status = status
    this.code = code;
    this.name = this.constructor.name;
  }
}

export type AppError = HttpError | MailManError;

const errors = {
  BadRequest: (message = 'Bad Request') => new createError.BadRequest(message),
  Unauthorized: (message = 'Unauthorized') => new createError.Unauthorized(message),
  Forbidden: (message = 'Forbidden') => new createError.Forbidden(message),
  NotFound: (message = 'Not Found') => new createError.NotFound(message),
  InternalServerError: (message = 'Internal Server Error') => new createError.InternalServerError(message),

  ValidationError: (message = "Validation Failed") => new MailManError(422, "VALIDATION_ERROR", message),
  FileTooLargeError: (message ="The uploaded file exceeds the size limit of 10MB") => new MailManError(413,"FILE_SIZE_TOO_LARGE_ERROR", message),
  DatabaseError: (message = "Database Query Failed") => new MailManError(500, "DATABASE_ERROR", message),
  OAuthError: (message = "Google OAuth Failure") => new MailManError(500, "OAUTH_ERROR", message),
  TokenExpiredError: (message = "Token has Expired") => new MailManError(401, "TOKEN_EXPIRED", message),
  TokenVerificationFailedError:(message = "Invalid token. Please log in again.") => new MailManError(403, "TOKEN_VERIFICATION_FAILED", message),
  FileNotFoundError: (message = "file not found") => new MailManError(404, "FILE_NOT_FOUND", message),
};

export default errors;