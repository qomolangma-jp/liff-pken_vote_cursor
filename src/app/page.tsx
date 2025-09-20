'use client';
import React, { memo, useEffect } from 'react';
import { useLiff } from '@/hooks/useLiff';
import { useUserStore } from '@/store/userStore';
import { useSurveyStore } from '@/store/surveyStore';
import { UserRegistrationForm } from '@/components/forms/UserRegistrationForm';
import { LoadingSpinner, SurveyList } from '@/components/ui';
import { mapSurveyHistoryWithStatus } from '@/utils/surveyStatus';
import Link from 'next/link';
import styles from './page.module.css';

const Dashboard: React.FC = memo(() => {
  const { user } = useUserStore();
  const { surveyHistory, loading: historyLoading, fetchSurveyHistory } = useSurveyStore();
  
  useEffect(() => {
    if (user) {
      fetchSurveyHistory(user.id);
    }
  }, [user, fetchSurveyHistory]);
  
  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          ようこそ、{user?.name || 'ユーザー'}さん！
        </div>
        <div className={styles.subtitle}>
          Pken Vote で投票・アンケートに参加しよう
        </div>
      </header>
      
      <section className={styles.quickActions}>
        <div className={styles.actionGrid}>
          <Link href="/survey-history" className={styles.actionCard}>
            <div className={styles.actionIcon}>📊</div>
            <div className={styles.actionContent}>
              <h3>アンケート履歴</h3>
              <p>過去の回答を確認</p>
            </div>
          </Link>
          <Link href="/profile-edit" className={styles.actionCard}>
            <div className={styles.actionIcon}>👤</div>
            <div className={styles.actionContent}>
              <h3>プロフィール編集</h3>
              <p>個人情報を更新</p>
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.recentSurveys}>
        <h2 className={styles.sectionTitle}>最新のアンケート</h2>
        {historyLoading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="medium" />
          </div>
        ) : (
          <SurveyList 
            surveys={mapSurveyHistoryWithStatus(surveyHistory)} 
            limit={3}
            emptyMessage="新しいアンケートはありません。"
            showDate={true}
            showStatus={true}
          />
        )}
        {surveyHistory.length > 3 && (
          <div className={styles.viewAllContainer}>
            <Link href="/survey-history" className={styles.viewAllLink}>
              すべてのアンケートを見る →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
});

Dashboard.displayName = 'Dashboard';

const Page: React.FC = memo(() => {
  const { ready, error, profile } = useLiff();
  const { user, loading, fetchUser, initialized } = useUserStore();

  useEffect(() => {
    if (ready && profile && !initialized) {
      fetchUser(profile.userId);
    }
  }, [ready, profile, fetchUser, initialized]);

  if (error) {
    return (
      <main className={styles.error}>
        <pre>LIFF Error: {error}</pre>
      </main>
    );
  }

  if (!ready || loading) {
    return (
      <main className={styles.loading}>
        <LoadingSpinner size="large" />
      </main>
    );
  }
  //console.log('LIFF ready. profile:', profile, 'user:', user, 'mock:', mock);

  // ログイン済みユーザーの場合
  if (user && user.id !== 0) {
    return <Dashboard />;
  }

  // 未登録ユーザーの場合
  return (
    <main className={styles.registration}>
      <UserRegistrationForm 
        onSuccess={() => window.location.reload()} 
      />
    </main>
  );
});

Page.displayName = 'Page';

export default Page;
