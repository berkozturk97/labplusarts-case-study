import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// Define error types for better type safety
interface ApiErrorData {
  message?: string;
  error?: string;
  detail?: string;
  description?: string;
  errors?: string[] | Record<string, string[] | string>;
}

interface ApiError {
  status?: number | string;
  data?: string | ApiErrorData;
  error?: string;
}

// Configuration for the error toast middleware
interface ErrorToastConfig {
  showNetworkErrors: boolean;
  showValidationErrors: boolean;
  showServerErrors: boolean;
  defaultErrorMessage: string;
  toastDuration: number;
}

const defaultConfig: ErrorToastConfig = {
  showNetworkErrors: true,
  showValidationErrors: true,
  showServerErrors: true,
  defaultErrorMessage: "An unexpected error occurred. Please try again.",
  toastDuration: 6000,
};

// Helper function to extract error message from different error formats
const extractErrorMessage = (error: ApiError): string => {
  // Handle RTK Query error format
  if (error?.data) {
    // Handle different API error response formats
    if (typeof error.data === "string") {
      return error.data;
    }

    if (typeof error.data === "object") {
      // Check common error message fields
      const errorData = error.data;
      if (errorData.message) return errorData.message;
      if (errorData.error) return errorData.error;
      if (errorData.detail) return errorData.detail;
      if (errorData.description) return errorData.description;

      // Handle validation errors array
      if (Array.isArray(errorData.errors)) {
        return errorData.errors
          .map((err: string | { message?: string }) =>
            typeof err === "string" ? err : err.message || "Validation error"
          )
          .join(", ");
      }

      // Handle field-specific validation errors
      if (errorData.errors && typeof errorData.errors === "object") {
        const fieldErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(", ")}`;
            }
            return `${field}: ${messages}`;
          })
          .join("; ");
        return fieldErrors;
      }
    }
  }

  // Handle network/fetch errors
  if (error?.error) {
    return error.error;
  }

  // Handle direct error messages
  if (typeof error === "string") {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  return defaultConfig.defaultErrorMessage;
};

// Helper function to determine error type and whether to show it
const shouldShowError = (error: ApiError, config: ErrorToastConfig): boolean => {
  // Network/connection errors
  if (error?.status === "FETCH_ERROR" || error?.status === "TIMEOUT_ERROR") {
    return config.showNetworkErrors;
  }

  // Validation errors (4xx)
  if (typeof error?.status === "number" && error.status >= 400 && error.status < 500) {
    return config.showValidationErrors;
  }

  // Server errors (5xx)
  if (typeof error?.status === "number" && error.status >= 500) {
    return config.showServerErrors;
  }

  // Show other errors by default
  return true;
};

// Helper function to get appropriate toast type based on error status
const getToastType = (error: ApiError): "error" | "warning" => {
  // Validation errors are warnings
  if (typeof error?.status === "number" && error.status >= 400 && error.status < 500) {
    return "warning";
  }

  // Everything else is an error
  return "error";
};

// Create the error toast middleware
export const createErrorToastMiddleware = (userConfig: Partial<ErrorToastConfig> = {}): Middleware => {
  const config = { ...defaultConfig, ...userConfig };

  return () => next => action => {
    // Check if this is a rejected RTK Query action
    if (isRejectedWithValue(action)) {
      const error = action.payload as ApiError;

      // Extract action type to identify the API call
      const actionType = action.type;
      let apiCallName = "API call";

      // Try to extract a readable name from the action type
      if (actionType.includes("/")) {
        const parts = actionType.split("/");
        const endpointName = parts[1]; // Usually the endpoint name
        if (endpointName) {
          apiCallName = endpointName
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .trim();
        }
      }

      // Check if we should show this error
      if (shouldShowError(error, config)) {
        const errorMessage = extractErrorMessage(error);
        const toastType = getToastType(error);

        // Show the toast
        const toastMessage = `${apiCallName}: ${errorMessage}`;

        if (toastType === "warning") {
          toast.warning(toastMessage, {
            position: "top-right",
            autoClose: config.toastDuration,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.error(toastMessage, {
            position: "top-right",
            autoClose: config.toastDuration,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        // Log the error for debugging
        console.error(`${apiCallName} failed:`, error);
      }
    }

    return next(action);
  };
};

// Export a default configured middleware
export const errorToastMiddleware = createErrorToastMiddleware();
