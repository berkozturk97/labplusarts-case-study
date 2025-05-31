import React from "react";
import LoadingSpinner from "../LoadingSpinner";
import styles from "./styles.module.css";

interface PageLoaderProps {
  text?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ text = "Loading page..." }) => {
  return (
    <div className={styles.pageLoader}>
      <LoadingSpinner size="medium" text={text} />
    </div>
  );
};

export default PageLoader;
