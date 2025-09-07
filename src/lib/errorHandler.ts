export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'ネットワークエラーが発生しました') {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface ErrorResponse {
  error: string;
  code?: string;
  field?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // ネットワークエラーの場合
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new ApiError(0, 'ネットワークエラーが発生しました');
    }
    
    return new ApiError(500, error.message);
  }

  return new ApiError(500, '予期しないエラーが発生しました');
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'リクエストが正しくありません';
      case 401:
        return '認証が必要です';
      case 403:
        return 'アクセスが拒否されました';
      case 404:
        return 'リソースが見つかりません';
      case 409:
        return 'データの競合が発生しました';
      case 500:
        return 'サーバーエラーが発生しました';
      default:
        return error.message;
    }
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  return '予期しないエラーが発生しました';
};
