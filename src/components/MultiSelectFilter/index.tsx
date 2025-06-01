import React, { useState, useMemo } from "react";
import styles from "./styles.module.css";
import type { MultiSelectFilter } from "../../hooks/usePageParams";

interface MultiSelectFilterProps {
  options: string[];
  value?: MultiSelectFilter;
  onChange: (values: string[]) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  maxHeight?: string;
}

const MultiSelectFilterComponent: React.FC<MultiSelectFilterProps> = ({
  options,
  value,
  onChange,
  onClear,
  label = "Filter",
  placeholder = "Search options...",
  disabled = false,
  className,
  searchable = true,
  maxHeight = "200px",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedValues = value?.values || [];

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;

    return options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm, searchable]);

  const handleToggleOption = (option: string) => {
    const isSelected = selectedValues.includes(option);
    const newValues = isSelected ? selectedValues.filter(v => v !== option) : [...selectedValues, option];

    onChange(newValues);
  };

  const handleSelectAll = () => {
    onChange([...options]);
  };

  const handleClearAll = () => {
    onChange([]);
    onClear?.();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const hasSelectedValues = selectedValues.length > 0;
  const isAllSelected = selectedValues.length === options.length;

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <label className={styles.label}>{label}</label>
        {hasSelectedValues && <span className={styles.selectedCount}>{selectedValues.length} selected</span>}
      </div>

      <div className={styles.dropdown}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
          aria-expanded={isOpen}
        >
          <span className={styles.triggerText}>
            {hasSelectedValues
              ? selectedValues.length === 1
                ? selectedValues[0]
                : `${selectedValues.length} items selected`
              : "Select options..."}
          </span>
          <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ""}`}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.content} style={{ maxHeight }}>
            {searchable && (
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={placeholder}
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" onClick={handleSelectAll} disabled={isAllSelected} className={styles.actionButton}>
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={!hasSelectedValues}
                className={styles.actionButton}
              >
                Clear All
              </button>
            </div>

            <div className={styles.optionsList}>
              {filteredOptions.length === 0 ? (
                <div className={styles.noOptions}>{searchTerm ? "No options found" : "No options available"}</div>
              ) : (
                filteredOptions.map(option => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <label key={option} className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleOption(option)}
                        className={styles.checkbox}
                      />
                      <span className={styles.optionText}>{option}</span>
                      {isSelected && <span className={styles.checkmark}>✓</span>}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop to close dropdown when clicked outside */}
      {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default MultiSelectFilterComponent;
