"use client";
import React, { memo } from "react";
import { Header, Navigation } from "./layout/index";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Navigation />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;