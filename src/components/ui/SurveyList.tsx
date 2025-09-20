"use client";
import React, { memo } from "react";
import Link from "next/link";
import { formatDate, formatDateTime } from "@/utils/dateFormat";
import styles from "./SurveyList.module.css";

interface SurveyItem {
  id: string | number;
  title: string;
  date: string;
  status?: 'answered' | 'unanswered' | 'pending';
  // 回答日時（回答済みの場合のみ）
  replyDate?: string;
}

interface SurveyListProps {
  surveys: SurveyItem[];
  limit?: number;
  emptyMessage?: string;
  showDate?: boolean;
  showStatus?: boolean;
  linkPrefix?: string;
}

const SurveyList: React.FC<SurveyListProps> = memo(({
  surveys,
  limit,
  emptyMessage = "アンケートはありません。",
  showDate = true,
  showStatus = true,
  linkPrefix = "/survey-detail"
}) => {
  const displaySurveys = limit ? surveys.slice(0, limit) : surveys;

  const getStatusBadge = (status?: string) => {
    // デバッグ用ログ出力
    console.log('Rendering badge for status:', status);
    
    switch (status) {
      case 'answered':
        return (
          <span className={`${styles.badge} ${styles.badgeAnswered}`}>
            ✓ 回答済み
          </span>
        );
      case 'unanswered':
        return (
          <span className={`${styles.badge} ${styles.badgeUnanswered}`}>
            ! 未回答
          </span>
        );
      case 'pending':
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            ⏱ 保留中
          </span>
        );
      default:
        // statusが不明な場合も表示
        return status ? (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            ? {status}
          </span>
        ) : null;
    }
  };

  if (surveys.length === 0) {
    return (
      <div className={styles.empty}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {displaySurveys.map((survey, idx) => (
        <li key={survey.id || idx} className={styles.item}>
          <Link href={`${linkPrefix}?id=${survey.id}`} className={styles.link}>
            <div className={styles.content}>
              <div className={styles.titleRow}>
                <h3 className={styles.title}>{survey.title}</h3>
                {showStatus && getStatusBadge(survey.status)}
              </div>
              {showDate && (
                <div className={styles.dateContainer}>
                  <time className={styles.date}>作成: {formatDate(survey.date)}</time>
                  {survey.status === 'answered' && survey.replyDate && (
                    <time className={styles.replyDate}>回答: {formatDateTime(survey.replyDate)}</time>
                  )}
                </div>
              )}
            </div>
            <div className={styles.arrow}>→</div>
          </Link>
        </li>
      ))}
    </ul>
  );
});

SurveyList.displayName = 'SurveyList';

export { SurveyList };
export type { SurveyItem };