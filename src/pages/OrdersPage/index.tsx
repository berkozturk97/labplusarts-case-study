import React from "react";
import styles from "./styles.module.css";
import { useFilterOrdersQuery } from "../../services/orders";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { Order } from "../../types/api";

const OrdersPage: React.FC = () => {
  const { data: response, error, isLoading } = useFilterOrdersQuery();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="large" text="Loading Orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>Failed to load orders data. Please try again.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const orders = response?.data || [];
  const columnNames = response?.tableColumnNames || [];

  // Calculate statistics
  const totalRevenue = orders
    .filter((order: Order) => order.status !== "Cancelled")
    .reduce((sum: number, order: Order) => sum + order.total, 0);

  const statusCounts = orders.reduce((acc: Record<string, number>, order: Order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders Management</h1>
        <p className={styles.subtitle}>Track and manage all customer orders</p>
      </div>

      {orders.length > 0 && (
        <DataTable
          data={orders as unknown as Record<string, unknown>[]}
          columnNames={columnNames}
          loading={isLoading}
          searchPlaceholder="Search orders by number, customer, status..."
          showRowNumbers={true}
          onRowClick={(order, index: number) => {
            console.log("Order clicked:", order, "at index:", index);
          }}
          emptyText="No orders found"
        />
      )}

      <div className={styles.footer}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Orders:</span>
            <span className={styles.statValue}>{orders.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Revenue:</span>
            <span className={styles.statValue}>${totalRevenue.toFixed(2)}</span>
          </div>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className={styles.statItem}>
              <span className={styles.statLabel}>{status}:</span>
              <span className={styles.statValue}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
