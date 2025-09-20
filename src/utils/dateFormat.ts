/**
 * 日時フォーマット関数
 */
export const formatDateTime = (dateTimeString: string | null | undefined): string => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    
    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      return dateTimeString;
    }
    
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateTimeString; // フォーマットに失敗した場合は元の文字列を返す
  }
};

/**
 * 日付のみフォーマット関数
 */
export const formatDate = (dateTimeString: string | null | undefined): string => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    
    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      return dateTimeString;
    }
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateTimeString; // フォーマットに失敗した場合は元の文字列を返す
  }
};

/**
 * 相対時間フォーマット関数
 */
export const formatRelativeTime = (dateTimeString: string | null | undefined): string => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今日';
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return formatDate(dateTimeString);
    }
  } catch {
    return dateTimeString;
  }
};