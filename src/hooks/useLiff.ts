import { useEffect, useState } from 'react';
import { LiffState, LiffProfile } from '@/lib/wp-api';

// window.liff型ガード
function isLiffAvailable(obj: unknown): obj is { 
  liff: { 
    isLoggedIn: () => boolean; 
    getProfile: () => Promise<LiffProfile>;
    init: (config: { liffId: string }) => Promise<void>;
    login: (config: { redirectUri: string }) => Promise<void>;
  } 
} {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "liff" in obj &&
    typeof (obj as { liff: unknown }).liff === "object" &&
    (obj as { liff: { isLoggedIn?: unknown; getProfile?: unknown; init?: unknown; login?: unknown } }).liff !== null &&
    typeof (obj as { liff: { isLoggedIn?: unknown } }).liff.isLoggedIn === "function" &&
    typeof (obj as { liff: { getProfile?: unknown } }).liff.getProfile === "function" &&
    typeof (obj as { liff: { init?: unknown } }).liff.init === "function" &&
    typeof (obj as { liff: { login?: unknown } }).liff.login === "function"
  );
}

export const useLiff = () => {
  const [state, setState] = useState<LiffState>({ ready: false });

  useEffect(() => {
    const initializeLiff = async () => {
      // NEXT_PUBLIC_LIFF_DISABLEDが"true"ならLIFF無効、それ以外・未定義なら有効
      const disabled = process.env.NEXT_PUBLIC_LIFF_DISABLED === 'true';
      const enabled = !disabled;
      console.log('LIFF_ENABLED:', enabled);
      if (!enabled){
        // ローカル開発モード
        console.log('ローカルモードで動作します。');

        setState({
          ready: true,
          mock: true,
          profile: {
            userId: 'Uc58e187a6ffc603001d600d8b5031775',
            displayName: 'Local User',
            pictureUrl: undefined,
            statusMessage: undefined,
          },
        });
        return;
      }

      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId || liffId === 'eee') {
          console.warn('LIFF IDが設定されていません。モックモードで動作します。');
          setState({
            ready: true,
            mock: true,
            profile: {
              userId: 'Uc58e187a6ffc603001d600d8b5031775',
              displayName: 'Mock User (No LIFF ID)',
              pictureUrl: undefined,
              statusMessage: undefined,
            },
          });
          return;
        }

        // LIFF SDKの読み込みを待つ
        let retryCount = 0;
        const maxRetries = 20; // リトライ回数を増やす
        
        while (retryCount < maxRetries) {
          if (typeof window !== "undefined" && isLiffAvailable(window)) {
            break;
          }
          
          // 200ms待ってから再試行
          await new Promise(resolve => setTimeout(resolve, 200));
          retryCount++;
        }

        if (typeof window !== "undefined" && isLiffAvailable(window)) {
          try {
            await window.liff.init({ liffId });
            
            if (!window.liff.isLoggedIn()) {
              await window.liff.login({ redirectUri: window.location.href });
              return;
            }
            
            const profile = await window.liff.getProfile();
            setState({ ready: true, profile });
          } catch (liffError) {
            console.error('LIFF init/login error:', liffError);
            throw new Error(`LIFF初期化エラー: ${liffError instanceof Error ? liffError.message : '不明なエラー'}`);
          }
        } else {
          // フォールバック: モックモードで動作
          console.warn('LIFF SDKが利用できません。モックモードで動作します。');
          setState({
            ready: true,
            mock: true,
            profile: {
              userId: 'mock-user-001',
              displayName: 'Mock User',
              pictureUrl: undefined,
              statusMessage: undefined,
            },
          });
        }
      } catch (error) {
        console.error('LIFF initialization error:', error);
        setState({
          ready: false,
          error: error instanceof Error ? error.message : 'LIFF初期化エラー',
        });
      }
    };

    initializeLiff();
  }, []);

  return state;
};
