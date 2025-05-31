import React from "react";
import styles from "./styles.module.css";
import { useGetAllUsersQuery } from "../../services/users";
import { useGetAllOrdersQuery } from "../../services/orders";
import LoadingSpinner from "../../components/LoadingSpinner";

const HomePage: React.FC = () => {
  const { data: users, isLoading: isLoadingUsers } = useGetAllUsersQuery({});
  const { data: orders, isLoading: isLoadingOrders } = useGetAllOrdersQuery({});
  return (
    <div className={styles.container}>
      {isLoadingUsers || isLoadingOrders ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.hero}>
          <h1 className={styles.title}>Welcome to Dashboard</h1>
          <p className={styles.subtitle}>Check your orders and users from one place</p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statNumber}>{orders?.length}</h3>
              <p className={styles.statLabel}>Total Orders</p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statNumber}>{users?.length}</h3>
              <p className={styles.statLabel}>Active Users</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
