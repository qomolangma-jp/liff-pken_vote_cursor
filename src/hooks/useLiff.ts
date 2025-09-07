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
      const enabled = process.env.NEXT_PUBLIC_LIFF_ENABLED !== 'false';
      
      if (!enabled) {
        // ローカル開発モード
        setState({
          ready: true,
          mock: true,
          profile: {
            userId: 'local-000',
            displayName: 'Local User',
            pictureUrl: undefined,
            statusMessage: undefined,
          },
        });
        return;
      }

      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          throw new Error('LIFF IDが設定されていません');
        }

        if (typeof window !== "undefined" && isLiffAvailable(window)) {
          await window.liff.init({ liffId });
          
          if (!window.liff.isLoggedIn()) {
            await window.liff.login({ redirectUri: window.location.href });
            return;
          }
          
          const profile = await window.liff.getProfile();
          setState({ ready: true, profile });
        } else {
          throw new Error('LIFF SDKが利用できません');
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
