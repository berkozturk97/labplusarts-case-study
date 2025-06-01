import React from "react";
import styles from "./styles.module.css";
import type { DateRangeFilter } from "../../hooks/usePageParams";

interface DateRangeFilterProps {
  value?: DateRangeFilter;
  onChange: (dateRange: DateRangeFilter) => void;
  onClear?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const DateRangeFilterComponent: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  onClear,
  label = "Date Range",
  disabled = false,
  className,
}) => {
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = event.target.value || undefined;
    onChange({
      startDate,
      endDate: value?.endDate,
    });
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = event.target.value || undefined;
    onChange({
      startDate: value?.startDate,
      endDate,
    });
  };

  const handleClear = () => {
    onChange({ startDate: undefined, endDate: undefined });
    onClear?.();
  };

  const hasValue = value?.startDate || value?.endDate;

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
            aria-label="Clear date range"
          >
            Clear
          </button>
        )}
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>From</label>
          <input
            type="date"
            value={value?.startDate || ""}
            onChange={handleStartDateChange}
            disabled={disabled}
            className={styles.dateInput}
            max={value?.endDate} // Can't select start date after end date
          />
        </div>

        <div className={styles.separator}>
          <span>to</span>
        </div>

        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>To</label>
          <input
            type="date"
            value={value?.endDate || ""}
            onChange={handleEndDateChange}
            disabled={disabled}
            className={styles.dateInput}
            min={value?.startDate} // Can't select end date before start date
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilterComponent;
