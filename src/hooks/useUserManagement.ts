import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateUserMutation } from "../services/users";
import type { UserFormData } from "../components/UserForm";
import type { User } from "../types/api";

export interface UseUserManagementResult {
  createUser: (userData: UserFormData) => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

export const useUserManagement = (): UseUserManagementResult => {
  const [createUserMutation, { isLoading: isCreating }] = useCreateUserMutation();
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: UserFormData): Promise<void> => {
    try {
      setError(null);

      // Prepare the user data with auto-generated fields
      const newUser: Omit<User, "id"> = {
        ...userData,
        createdAt: new Date().toISOString().split("T")[0], // YYYY-MM-DD format to match db.json
        canBeFilteredPropsWithDropdown: ["role", "isActive"], // Add the required field
      };

      // Call the mutation
      await createUserMutation(newUser).unwrap();

      // Show success toast
      toast.success(`User "${userData.name}" has been created successfully!`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err: unknown) {
      // Handle different types of errors
      let errorMessage = "Failed to create user. Please try again.";

      if (err && typeof err === "object") {
        if ("data" in err && err.data && typeof err.data === "object") {
          const errorData = err.data as { message?: string; error?: string };
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else if ("message" in err && typeof err.message === "string") {
          errorMessage = err.message;
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      // Set error state
      setError(errorMessage);

      // Show error toast
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      throw err;
    }
  };

  return {
    createUser,
    isCreating,
    error,
  };
};
