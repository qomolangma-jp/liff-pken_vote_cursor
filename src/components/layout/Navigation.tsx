import React, { memo } from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'ダッシュボード',
    icon: (
      <svg width="24" height="24" fill="none">
        <path d="M3 12L12 4l9 8" stroke="#1976d2" strokeWidth="2"/>
        <path d="M5 10v10h14V10" stroke="#1976d2" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    href: '/survey-history',
    label: 'アンケート一覧',
    icon: (
      <svg width="24" height="24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#1976d2" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="#1976d2" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    href: '/profile-edit',
    label: 'プロフィール',
    icon: (
      <svg width="24" height="24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="#1976d2" strokeWidth="2"/>
        <path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="#1976d2" strokeWidth="2"/>
      </svg>
    ),
  },
];

export const Navigation: React.FC = memo(() => {
  return (
    <nav className={styles.footerNav}>
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href} className={styles.navItem}>
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
});

Navigation.displayName = 'Navigation';
