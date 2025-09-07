'use client';
import React, { memo, useEffect } from 'react';
import { useLiff } from '@/hooks/useLiff';
import { useUserStore } from '@/store/userStore';
import { UserRegistrationForm } from '@/components/forms/UserRegistrationForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import styles from './page.module.css';

const Dashboard: React.FC = memo(() => {
  const { user } = useUserStore();
  
  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        ようこそ、{user?.name || 'ユーザー'}さん！
      </header>
      <nav className={styles.dashboardNav}>
        <ul className={styles.dashboardList}>
          <li>
            <Link href="/survey-history" className={styles.dashboardLink}>
              アンケート履歴
            </Link>
          </li>
          <li>
            <Link href="/survey-detail" className={styles.dashboardLink}>
              アンケート詳細
            </Link>
          </li>
          <li>
            <Link href="/profile-edit" className={styles.dashboardLink}>
              プロフィール編集
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
});

Dashboard.displayName = 'Dashboard';

const Page: React.FC = memo(() => {
  const { ready, error, profile, mock } = useLiff();
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
