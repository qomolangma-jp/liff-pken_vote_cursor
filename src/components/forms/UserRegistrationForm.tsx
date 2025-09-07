import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useUserStore } from '@/store/userStore';
import { api, RegisterRequest, getErrorMessage } from '@/lib/api';
import { useLiff } from '@/hooks/useLiff';
import styles from './UserRegistrationForm.module.css';

interface FormData {
  grade: string;
  class: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  email: string;
}

const grades = [
  { label: '1年', value: 1 },
  { label: '2年', value: 2 },
  { label: '3年', value: 3 }
];

const classes = Array.from({ length: 9 }, (_, i) => ({ 
  label: `${i + 1}組`, 
  value: i + 1 
}));

export interface UserRegistrationFormProps {
  onSuccess?: () => void;
  lineId?: string;
}

export const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ onSuccess, lineId }) => {
  const { user, fetchUser } = useUserStore();
  const { profile } = useLiff();
  lineId = profile?.userId;
  const [form, setForm] = useState<FormData>({
    grade: '',
    class: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }, [error]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const registerData: RegisterRequest = {
        ...form,
        grade: Number(form.grade),
        class: Number(form.class),
        line_id: lineId || user?.line_id || ''
      };

      await api.register(registerData);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [form, user?.line_id, onSuccess]);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>ユーザー登録</h2>
      
      {lineId && (
        <div className={styles.lineId}>
          LINE ID: {lineId}
        </div>
      )}

      <Select
        label="学年"
        name="grade"
        value={form.grade}
        onChange={handleChange}
        options={grades}
        required
      />

      <Select
        label="クラス"
        name="class"
        value={form.class}
        onChange={handleChange}
        options={classes}
        required
      />

      <Input
        label="氏"
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        required
      />

      <Input
        label="名"
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        required
      />

      <Input
        label="カナ（氏）"
        name="lastNameKana"
        value={form.lastNameKana}
        onChange={handleChange}
        required
      />

      <Input
        label="カナ（名）"
        name="firstNameKana"
        value={form.firstNameKana}
        onChange={handleChange}
        required
      />

      <Input
        label="メールアドレス"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className={styles.submitButton}
      >
        登録
      </Button>
    </form>
  );
};
