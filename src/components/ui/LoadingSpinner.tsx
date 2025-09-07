import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  className = ''
}) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    styles[color],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses} role="status" aria-label="読み込み中">
      <span className="sr-only">読み込み中...</span>
    </div>
  );
};
