"use client";
import React, { useEffect, memo } from "react";
import { useUserStore } from "@/store/userStore";
import { useSurveyStore } from "@/store/surveyStore";
import { LoadingSpinner, SurveyList } from "@/components/ui";
import { mapSurveyHistoryWithStatus } from "@/utils/surveyStatus";
import styles from "./page.module.css";

const SurveyHistoryPage: React.FC = memo(() => {
  const { user, loading } = useUserStore();
  const { surveyHistory, loading: historyLoading, fetchSurveyHistory } = useSurveyStore();

  useEffect(() => {
    if (user) {
      fetchSurveyHistory(user.id);
    }
  }, [user, fetchSurveyHistory]);

  if (loading || historyLoading) {
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
      <h2 className={styles.sectionTitle}>アンケート履歴</h2>
      <SurveyList 
        surveys={mapSurveyHistoryWithStatus(surveyHistory)} 
        emptyMessage="履歴はありません。"
        showDate={true}
        showStatus={true}
      />
    </main>
  );
});

SurveyHistoryPage.displayName = 'SurveyHistoryPage';

export default SurveyHistoryPage;