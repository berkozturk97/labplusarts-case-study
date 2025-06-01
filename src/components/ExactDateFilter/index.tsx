import React from "react";
import styles from "./styles.module.css";
import type { ExactDateFilter } from "../../hooks/usePageParams";

interface ExactDateFilterProps {
  value?: ExactDateFilter;
  onChange: (exactDate: ExactDateFilter) => void;
  onClear?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

const ExactDateFilterComponent: React.FC<ExactDateFilterProps> = ({
  value,
  onChange,
  onClear,
  label = "Date",
  disabled = false,
  className,
  min,
  max,
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value || undefined;
    onChange({ date });
  };

  const handleClear = () => {
    onChange({ date: undefined });
    onClear?.();
  };

  const hasValue = Boolean(value?.date);

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <label className={styles.label}>{label}</label>
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            disabled={disabled}
            aria-label="Clear date"
          >
            Clear
          </button>
        )}
      </div>

      <input
        type="date"
        value={value?.date || ""}
        onChange={handleDateChange}
        disabled={disabled}
        className={styles.dateInput}
        min={min}
        max={max}
      />
    </div>
  );
};

export default ExactDateFilterComponent;
