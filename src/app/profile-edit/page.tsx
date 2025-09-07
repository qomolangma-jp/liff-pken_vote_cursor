"use client";
import React, { useEffect, useState, memo } from "react";
import { useUserStore } from "@/store/userStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import styles from "./page.module.css";

interface ProfileFormData {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  email: string;
}

const ProfileEditPage: React.FC = memo(() => {
  const { user, loading } = useUserStore();
  const [form, setForm] = useState<ProfileFormData>({
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    email: "",
  });
  const [saved, setSaved] = useState(false);

  // user情報が取得できたらformに反映
  useEffect(() => {
    if (user) {
      setForm({
        lastName: user.last_name || "",
        firstName: user.first_name || "",
        lastNameKana: user.last_kana || "",
        firstNameKana: user.first_kana || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ここでプロフィール更新APIを呼ぶ（API実装が必要）
    setSaved(true);
  };

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
      <div className={styles.formCard}>
        <h2 className={styles.title}>プロフィール編集</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="氏"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
          <Input
            label="名"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
          />
          <Input
            label="カナ（氏）"
            name="lastNameKana"
            value={form.lastNameKana}
            onChange={handleChange}
          />
          <Input
            label="カナ（名）"
            name="firstNameKana"
            value={form.firstNameKana}
            onChange={handleChange}
          />
          <Input
            label="メールアドレス"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <Button type="submit" className={styles.submitButton}>
            保存
          </Button>
          {saved && (
            <div className={styles.successMessage}>
              保存しました
            </div>
          )}
        </form>
      </div>
    </main>
  );
});

ProfileEditPage.displayName = 'ProfileEditPage';

export default ProfileEditPage;