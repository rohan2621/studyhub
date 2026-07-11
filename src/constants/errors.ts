export enum AppError {
  NETWORK_ERROR    = 'NETWORK_ERROR',
  TOKEN_EXPIRED    = 'TOKEN_EXPIRED',
  DEVICE_MISMATCH  = 'DEVICE_MISMATCH',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FORBIDDEN        = 'FORBIDDEN',
  NOT_FOUND        = 'NOT_FOUND',
  SERVER_ERROR     = 'SERVER_ERROR',
  UNKNOWN_ERROR    = 'UNKNOWN_ERROR',
}

export const ErrorMessages: Record<AppError, string> = {
  [AppError.NETWORK_ERROR]:    'No internet connection. Please check your network.',
  [AppError.TOKEN_EXPIRED]:    'Your access has expired. Contact support to renew.',
  [AppError.DEVICE_MISMATCH]:  'This token is active on another device. Contact support to reset it.',
  [AppError.VALIDATION_ERROR]: 'Please check your inputs and try again.',
  [AppError.FORBIDDEN]:        'You do not have permission to access this content.',
  [AppError.NOT_FOUND]:        'The requested content could not be found.',
  [AppError.SERVER_ERROR]:     'Something went wrong on our end. Please try again later.',
  [AppError.UNKNOWN_ERROR]:    'An unexpected error occurred. Please try again.',
};
