import React, { memo } from 'react';
import Image from 'next/image';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = memo(({ 
  title = 'Pken Vote サービス',
  showLogo = true 
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        {showLogo && (
          <Image 
            src="/logo.png" 
            alt="ロゴ" 
            className={styles.logo} 
            width={40} 
            height={40} 
            priority 
          />
        )}
        <span className={styles.serviceName}>{title}</span>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
