import React from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import styles from "./styles.module.css";

// User form data interface (excluding auto-generated fields)
export interface UserFormData {
  name: string;
  email: string;
  role: "Admin" | "User" | "Manager";
  isActive: boolean;
}

// Form props interface
export interface UserFormProps {
  onSubmit: (data: UserFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<UserFormData>;
  isLoading?: boolean;
  submitButtonText?: string;
  showCancelButton?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  submitButtonText = "Create User",
  showCancelButton = true,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      role: initialData?.role || "User",
      isActive: initialData?.isActive ?? true,
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  // Handle form submission
  const onSubmitHandler: SubmitHandler<UserFormData> = async data => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset();
      }
    } catch (error) {
      // Error handling is done in parent component via toast
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
      {/* Name Field */}
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Full Name <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
          placeholder="Enter full name"
          disabled={isFormDisabled}
          {...register("name", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters long",
            },
            maxLength: {
              value: 100,
              message: "Name must not exceed 100 characters",
            },
            pattern: {
              value: /^[a-zA-Z\s'-]+$/,
              message: "Name can only contain letters, spaces, hyphens, and apostrophes",
            },
          })}
        />
        {errors.name && (
          <span className={styles.errorMessage} role="alert">
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Email Field */}
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email Address <span className={styles.required}>*</span>
        </label>
        <input
          id="email"
          type="email"
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          placeholder="Enter email address"
          disabled={isFormDisabled}
          {...register("email", {
            required: "Email address is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please enter a valid email address",
            },
            maxLength: {
              value: 254,
              message: "Email address is too long",
            },
          })}
        />
        {errors.email && (
          <span className={styles.errorMessage} role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Role Field */}
      <div className={styles.field}>
        <label htmlFor="role" className={styles.label}>
          Role <span className={styles.required}>*</span>
        </label>
        <select
          id="role"
          className={`${styles.select} ${errors.role ? styles.inputError : ""}`}
          disabled={isFormDisabled}
          {...register("role", {
            required: "Role is required",
          })}
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
        </select>
        {errors.role && (
          <span className={styles.errorMessage} role="alert">
            {errors.role.message}
          </span>
        )}
      </div>

      {/* Status Field */}
      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" className={styles.checkbox} disabled={isFormDisabled} {...register("isActive")} />
          <span className={styles.checkboxText}>Active User</span>
        </label>
        <span className={styles.helpText}>Active users can log in and access the system</span>
      </div>

      {/* Form Actions */}
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

export default UserForm;
