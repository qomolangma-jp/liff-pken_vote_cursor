import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useSurveyStore } from '@/store/surveyStore';
import { useUserStore } from '@/store/userStore';
import { SurveyForm as SurveyFormType, getErrorMessage } from '@/lib/api';
import { formatDateTime } from '@/utils/dateFormat';
import styles from './SurveyForm.module.css';

interface SurveyFormProps {
  onSuccess?: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ 
  onSuccess 
}) => {
  const { user } = useUserStore();
  const { currentSurvey, submitSurveyReply, loading, error } = useSurveyStore();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 前回回答内容を展開
  const prevAnswers = useMemo((): Record<string, string> => {
    if (!currentSurvey?.my_reply) return {};
    
    // form_dataから前回の回答を取得
    if (currentSurvey.my_reply.form_data) {
      try {
        // form_dataがオブジェクトの場合はそのまま使用
        if (typeof currentSurvey.my_reply.form_data === 'object') {
          return currentSurvey.my_reply.form_data as Record<string, string>;
        }
        // 文字列の場合はJSONパース
        if (typeof currentSurvey.my_reply.form_data === 'string') {
          return JSON.parse(currentSurvey.my_reply.form_data);
        }
      } catch (error) {
        console.warn('Failed to parse form_data:', error);
      }
    }
    
    // answerフィールドがある場合はそれを使用
    if (currentSurvey.my_reply.answer) {
      try {
        return JSON.parse(currentSurvey.my_reply.answer);
      } catch (error) {
        console.warn('Failed to parse answer:', error);
      }
    }
    
    return {};
  }, [currentSurvey?.my_reply]);

  // 前回の回答をformDataに設定（初期表示時のみ）
  useEffect(() => {
    // formDataが空の場合のみ前回の回答を設定
    if (Object.keys(formData).length === 0 && Object.keys(prevAnswers).length > 0) {
      setFormData(prevAnswers);
    }
  }, [prevAnswers, formData]);

  // 実際に回答済みかどうかを判定
  const hasActualReply = useMemo(() => {
    if (!currentSurvey?.my_reply) return false;
    
    // form_data（回答データ）があり、空でない場合は回答済み
    if (currentSurvey.my_reply.form_data) {
      try {
        return Object.keys(currentSurvey.my_reply.form_data).length > 0;
      } catch {
        return false;
      }
    }
    
    // answer フィールドがある場合も回答済み
    if (currentSurvey.my_reply.answer && currentSurvey.my_reply.answer.trim() !== '') {
      return true;
    }
    
    // reply_statusが'answered'の場合も回答済み
    if (currentSurvey.my_reply.reply_status === 'answered') {
      return true;
    }
    
    return false;
  }, [currentSurvey?.my_reply]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    const data: Record<string, string | number> = {
      ...formData,
      user_id: String(user.id),
      post_id: currentSurvey?.post?.id || 0,
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
      
      // 送信成功後、最新のアンケート詳細を再取得
      if (currentSurvey?.post?.id) {
        const { fetchSurveyDetail } = useSurveyStore.getState();
        await fetchSurveyDetail(user.id, String(currentSurvey.post.id));
      }
      
      // データ更新後にコールバック実行
      onSuccess?.();
    } catch (err) {
      console.error('Survey submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, currentSurvey, submitSurveyReply, onSuccess, isSubmitting]);

  const renderFormField = useCallback((form: SurveyFormType, formIdx: number) => {
    const formKey = `form_${formIdx}`;
    // 現在の入力値を優先し、なければ前回の回答を使用
    const currentValue = formData[formKey] || '';

    switch (form.fm_type) {
      case 'text':
        return (
          <Input
            key={formKey}
            label={form.fm_label}
            name={formKey}
            value={currentValue}
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
              value={currentValue}
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
                    checked={currentValue === option.trim()}
                    onChange={(e) => handleInputChange(formKey, e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>{option.trim()}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        const checkboxOptions = form.fm_value ? form.fm_value.split(',') : [];
        const selectedValues = currentValue ? currentValue.split(',') : [];
        
        const handleCheckboxChange = (optionValue: string, isChecked: boolean) => {
          let newValues: string[];
          if (isChecked) {
            // チェックされた場合、値を追加
            newValues = [...selectedValues, optionValue].filter(Boolean);
          } else {
            // チェックが外された場合、値を削除
            newValues = selectedValues.filter(val => val !== optionValue);
          }
          handleInputChange(formKey, newValues.join(','));
        };

        return (
          <div key={formKey} className={styles.formGroup}>
            <label className={styles.label}>{form.fm_label}</label>
            <div className={styles.checkboxGroup}>
              {checkboxOptions.map((option, optIdx) => {
                const optionValue = option.trim();
                const isChecked = selectedValues.includes(optionValue);
                return (
                  <label key={optIdx} className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      name={`${formKey}_${optIdx}`}
                      value={optionValue}
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange(optionValue, e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxLabel}>{optionValue}</span>
                  </label>
                );
              })}
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
            value={currentValue}
            onChange={(e) => handleInputChange(formKey, e.target.value)}
            options={selectOptions}
          />
        );

      default:
        return null;
    }
  }, [formData, handleInputChange]);

  if (!currentSurvey) {
    return <div className={styles.error}>アンケート情報が取得できませんでした。</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{currentSurvey.post?.group?.fm_title || 'アンケート'}</h2>
        {currentSurvey.post?.group?.fm_text && (
          <p className={styles.description}>{currentSurvey.post.group.fm_text}</p>
        )}
        {currentSurvey.post?.date && (
          <p className={styles.date}>日付: {currentSurvey.post.date}</p>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {currentSurvey.post?.form?.map((form: SurveyFormType, formIdx: number) => renderFormField(form, formIdx))}
        
        {hasActualReply && (currentSurvey.my_reply?.reply_updated || currentSurvey.my_reply?.reply_created) && (
          <div className={styles.previousAnswer}>
            前回の回答日時: {formatDateTime(currentSurvey.my_reply.reply_updated || currentSurvey.my_reply.reply_created)}
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {getErrorMessage(error)}
          </div>
        )}

        <Button
          type="submit"
          loading={loading || isSubmitting}
          disabled={loading || isSubmitting}
          className={styles.submitButton}
        >
          {hasActualReply ? '回答を修正' : '送信'}
        </Button>
      </form>
    </div>
  );
};
