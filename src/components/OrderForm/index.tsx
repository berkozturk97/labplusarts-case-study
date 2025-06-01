import React from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import styles from "./styles.module.css";

export interface OrderFormData {
  customer: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
}

export interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<OrderFormData>;
  isLoading?: boolean;
  submitButtonText?: string;
  showCancelButton?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  submitButtonText = "Create Order",
  showCancelButton = true,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrderFormData>({
    defaultValues: {
      customer: initialData?.customer || "",
      status: initialData?.status || "Pending",
      total: initialData?.total || 0,
    },
    mode: "onBlur",
  });

  const onSubmitHandler: SubmitHandler<OrderFormData> = async data => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="customer" className={styles.label}>
          Customer Name <span className={styles.required}>*</span>
        </label>
        <input
          id="customer"
          type="text"
          className={`${styles.input} ${errors.customer ? styles.inputError : ""}`}
          placeholder="Enter customer name"
          disabled={isFormDisabled}
          {...register("customer", {
            required: "Customer name is required",
            minLength: {
              value: 2,
              message: "Customer name must be at least 2 characters long",
            },
            maxLength: {
              value: 100,
              message: "Customer name must not exceed 100 characters",
            },
            pattern: {
              value: /^[a-zA-Z\s'-]+$/,
              message: "Customer name can only contain letters, spaces, hyphens, and apostrophes",
            },
          })}
        />
        {errors.customer && (
          <span className={styles.errorMessage} role="alert">
            {errors.customer.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="status" className={styles.label}>
          Order Status <span className={styles.required}>*</span>
        </label>
        <select
          id="status"
          className={`${styles.select} ${errors.status ? styles.inputError : ""}`}
          disabled={isFormDisabled}
          {...register("status", {
            required: "Order status is required",
          })}
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {errors.status && (
          <span className={styles.errorMessage} role="alert">
            {errors.status.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="total" className={styles.label}>
          Order Total <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.currencySymbol}>$</span>
          <input
            id="total"
            type="number"
            step="0.01"
            min="0"
            className={`${styles.input} ${styles.currencyInput} ${errors.total ? styles.inputError : ""}`}
            placeholder="0.00"
            disabled={isFormDisabled}
            {...register("total", {
              required: "Order total is required",
              valueAsNumber: true,
              min: {
                value: 0.01,
                message: "Order total must be greater than $0.00",
              },
              max: {
                value: 999999.99,
                message: "Order total cannot exceed $999,999.99",
              },
              validate: value => {
                const num = Number(value);
                if (isNaN(num)) return "Please enter a valid number";
                if (num < 0) return "Order total cannot be negative";
                if (Number(num.toFixed(2)) !== num) {
                  return "Order total can have at most 2 decimal places";
                }
                return true;
              },
            })}
          />
        </div>
        {errors.total && (
          <span className={styles.errorMessage} role="alert">
            {errors.total.message}
          </span>
        )}
        <span className={styles.helpText}>Enter the total amount for this order</span>
      </div>

      <div className={styles.actions}>
        {showCancelButton && (
          <button type="button" className={styles.cancelButton} onClick={handleCancel} disabled={isFormDisabled}>
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitButton} disabled={isFormDisabled}>
          {isFormDisabled ? (
            <>
              <div className={styles.spinner}></div>
              {isSubmitting ? "Creating..." : "Loading..."}
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;
