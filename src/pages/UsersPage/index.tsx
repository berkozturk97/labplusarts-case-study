import React from "react";
import styles from "./styles.module.css";
import { useFilterUsersQuery } from "../../services/users";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import type { User } from "../../types/api";

const UsersPage: React.FC = () => {
  const { data: response, error, isLoading } = useFilterUsersQuery();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="large" text="Loading Users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>Failed to load users data. Please try again.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const users = response?.data || [];
  const columnNames = response?.tableColumnNames || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users Management</h1>
        <p className={styles.subtitle}>Manage and view all users in the system</p>
      </div>

      {users.length > 0 && (
        <DataTable
          data={users as unknown as Record<string, unknown>[]}
          columnNames={columnNames}
          loading={isLoading}
          searchPlaceholder="Search users by name, email, role..."
          showRowNumbers={true}
          onRowClick={(user, index: number) => {
            console.log("User clicked:", user, "at index:", index);
          }}
          emptyText="No users found"
        />
      )}

      <div className={styles.footer}>
        <p className={styles.info}>
          Total Users: {users.length} | Active: {users.filter((user: User) => user.isActive).length} | Inactive:{" "}
          {users.filter((user: User) => !user.isActive).length}
        </p>
      </div>
    </div>
  );
};

export default UsersPage;
