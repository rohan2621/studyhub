import { AxiosError } from 'axios';
import { AppError } from '../constants/errors';

interface ApiErrorBody {
  code?: string;
  message?: string;
}

export function mapApiError(error: unknown): AppError {
  if (!(error instanceof AxiosError)) {
    return AppError.UNKNOWN_ERROR;
  }

  if (!error.response) {
    return AppError.NETWORK_ERROR;
  }

  const status = error.response.status;
  const body   = error.response.data as ApiErrorBody | undefined;
  const code   = body?.code ?? '';

  if (code === 'DEVICE_MISMATCH' || status === 409) return AppError.DEVICE_MISMATCH;
  if (code === 'TOKEN_EXPIRED')                      return AppError.TOKEN_EXPIRED;
  if (status === 401)                                return AppError.TOKEN_EXPIRED;
  if (status === 403)                                return AppError.FORBIDDEN;
  if (status === 404)                                return AppError.NOT_FOUND;
  if (status === 422)                                return AppError.VALIDATION_ERROR;
  if (status >= 500)                                 return AppError.SERVER_ERROR;

  return AppError.UNKNOWN_ERROR;
}
