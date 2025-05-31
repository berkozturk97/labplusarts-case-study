import React from "react";
import styles from "./styles.module.css";

const HomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to Dashboard</h1>
        <p className={styles.subtitle}>Check your orders, and users from one place</p>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statNumber}>1,234</h3>
            <p className={styles.statLabel}>Total Orders</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statNumber}>567</h3>
            <p className={styles.statLabel}>Active Users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
