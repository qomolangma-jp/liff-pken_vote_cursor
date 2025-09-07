import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useSurveyStore } from '@/store/surveyStore';
import { useUserStore } from '@/store/userStore';
import { SurveyForm as SurveyFormType, getErrorMessage } from '@/lib/api';
import styles from './SurveyForm.module.css';

interface SurveyFormProps {
  surveyId: string;
  onSuccess?: () => void;
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

export const SurveyForm: React.FC<SurveyFormProps> = ({ 
  surveyId, 
  onSuccess 
}) => {
  const { user } = useUserStore();
  const { currentSurvey, submitSurveyReply, loading, error } = useSurveyStore();
  const [formData, setFormData] = useState<Record<string, string>>({});

  // 前回回答内容を展開
  const prevAnswers = useMemo(() => {
    return currentSurvey?.my_reply?.str 
      ? JSON.parse(currentSurvey.my_reply.str) 
      : {};
  }, [currentSurvey?.my_reply?.str]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) return;

    const data: Record<string, any> = {
      ...formData,
      user_id: String(user.id),
      post_id: currentSurvey?.post?.ID || 0,
    };

    // 既存回答があればfm_re_idを付与（更新扱い）
    if (currentSurvey?.my_reply?.fm_re_id) {
      data.fm_re_id = currentSurvey.my_reply.fm_re_id;
    }

    // 数値フィールドの変換
    if (data.grade) data.grade = String(Number(data.grade));
    if (data.class) data.class = String(Number(data.class));

    try {
      await submitSurveyReply(data);
      onSuccess?.();
    } catch (err) {
      console.error('Survey submission error:', err);
    }
  }, [formData, user, currentSurvey, submitSurveyReply, onSuccess]);

  const renderFormField = useCallback((form: SurveyFormType, formIdx: number) => {
    const formKey = `form_${formIdx}`;
    const defaultValue = prevAnswers[formKey] || formData[formKey] || '';

    switch (form.fm_type) {
      case 'text':
        return (
          <Input
            key={formKey}
            label={form.fm_label}
            name={formKey}
            value={defaultValue}
            onChange={(e) => handleInputChange(formKey, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <div key={formKey} className={styles.formGroup}>
            <label className={styles.label}>{form.fm_label}</label>
            <textarea
              className={styles.textarea}
              name={formKey}
              rows={4}
              value={defaultValue}
              onChange={(e) => handleInputChange(formKey, e.target.value)}
            />
          </div>
        );

      case 'radio':
        const options = form.fm_value ? form.fm_value.split(',') : [];
        return (
          <div key={formKey} className={styles.formGroup}>
            <label className={styles.label}>{form.fm_label}</label>
            <div className={styles.radioGroup}>
              {options.map((option, optIdx) => (
                <label key={optIdx} className={styles.radioOption}>
                  <input
                    type="radio"
                    name={formKey}
                    value={option.trim()}
                    checked={defaultValue === option.trim()}
                    onChange={(e) => handleInputChange(formKey, e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>{option.trim()}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'select':
        const selectOptions = form.fm_value ? form.fm_value.split(',').map(opt => ({
          label: opt.trim(),
          value: opt.trim()
        })) : [];
        return (
          <Select
            key={formKey}
            label={form.fm_label}
            name={formKey}
            value={defaultValue}
            onChange={(e) => handleInputChange(formKey, e.target.value)}
            options={selectOptions}
          />
        );

      default:
        return null;
    }
  }, [prevAnswers, formData, handleInputChange]);

  if (!currentSurvey) {
    return <div className={styles.error}>アンケート情報が取得できませんでした。</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{currentSurvey.group?.fm_title || 'アンケート'}</h2>
        {currentSurvey.group?.fm_text && (
          <p className={styles.description}>{currentSurvey.group.fm_text}</p>
        )}
        {currentSurvey.date && (
          <p className={styles.date}>日付: {currentSurvey.date}</p>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {currentSurvey.form?.map((form, formIdx) => renderFormField(form, formIdx))}
        
        {currentSurvey.my_reply?.created && (
          <div className={styles.previousAnswer}>
            前回の回答日時: {currentSurvey.my_reply.created}
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {getErrorMessage(error)}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className={styles.submitButton}
        >
          送信
        </Button>
      </form>
    </div>
  );
};
