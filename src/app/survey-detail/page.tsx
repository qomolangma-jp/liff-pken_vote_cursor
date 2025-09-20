"use client";
import React, { useEffect, Suspense, memo } from "react";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useSurveyStore } from "@/store/surveyStore";
import { SurveyForm } from "@/components/forms/SurveyForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import styles from "./page.module.css";

const SurveyDetailContent: React.FC = memo(() => {
  const { user, loading } = useUserStore();
  const { currentSurvey, loading: surveyLoading, fetchSurveyDetail } = useSurveyStore();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (user && id) {
      fetchSurveyDetail(user.id, id);
    }
  }, [user, id, fetchSurveyDetail]);

  if (loading || surveyLoading) {
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

  if (!currentSurvey) {
    return (
      <main className={styles.error}>
        詳細情報が取得できませんでした。
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <SurveyForm 
        onSuccess={() => alert('送信しました')}
      />
    </main>
  );
});

SurveyDetailContent.displayName = 'SurveyDetailContent';

const SurveyDetailPage: React.FC = memo(() => {
  return (
    <Suspense fallback={
      <main className={styles.loading}>
        <LoadingSpinner size="large" />
      </main>
    }>
      <SurveyDetailContent />
    </Suspense>
  );
});

SurveyDetailPage.displayName = 'SurveyDetailPage';

export default SurveyDetailPage;
