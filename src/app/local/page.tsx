"use client";
import React, { memo } from "react";
import { useUserStore } from "@/store/userStore";
import { UserRegistrationForm } from "@/components/forms/UserRegistrationForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import styles from "./page.module.css";

const LocalTopPage: React.FC = memo(() => {
  const { user, loading } = useUserStore();

  if (loading) {
    return (
      <main className={styles.loading}>
        <LoadingSpinner size="large" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.error}>
        ログイン情報がありません。
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <UserRegistrationForm 
        onSuccess={() => window.location.reload()} 
      />
    </main>
  );
});

LocalTopPage.displayName = 'LocalTopPage';

export default LocalTopPage;
