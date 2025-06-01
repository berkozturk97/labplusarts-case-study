import React, { useRef } from "react";
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value || undefined;
    onChange({ date });
  };

  const handleClear = () => {
    onChange({ date: undefined });
    onClear?.();
  };

  // Handler to focus and show calendar when clicking anywhere on input
  const handleDateClick = () => {
    if (!disabled && dateInputRef.current) {
      dateInputRef.current.focus();
      // Use type assertion for showPicker as it's not in all TypeScript versions
      const picker = dateInputRef.current as unknown as { showPicker?: () => void };
      if (picker.showPicker) {
        picker.showPicker();
      }
    }
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
        ref={dateInputRef}
        type="date"
        value={value?.date || ""}
        onChange={handleDateChange}
        onClick={handleDateClick}
        disabled={disabled}
        className={styles.dateInput}
        min={min}
        max={max}
      />
    </div>
  );
};

export default ExactDateFilterComponent;
