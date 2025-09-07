"use client";
import React, { useEffect, memo } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";
import { useSurveyStore } from "@/store/surveyStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
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
      {surveyHistory.length === 0 ? (
        <div className={styles.historyEmpty}>履歴はありません。</div>
      ) : (
        <ul className={styles.historyList}>
          {surveyHistory.map((item, idx) => (
            <li key={idx} className={styles.historyItem}>
              <Link href={`/survey-detail?id=${item.id}`}>
                {item.title}（{item.date}）
              </Link>
            </li>
          ))}
        </ul>        
      )}
    </main>
  );
});

SurveyHistoryPage.displayName = 'SurveyHistoryPage';

export default SurveyHistoryPage;