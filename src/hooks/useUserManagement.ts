import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateUserMutation } from "../services/users";
import type { User } from "../types/api";
import type { UserFormData } from "../components/UserForm";

export const useUserManagement = () => {
  const [createUserMutation] = useCreateUserMutation();
  const [isCreating, setIsCreating] = useState(false);

  const createUser = async (userData: UserFormData): Promise<User> => {
    setIsCreating(true);

    try {
      // Auto-generate fields that the user shouldn't provide
      const userToCreate = {
        ...userData,
        createdAt: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        canBeFilteredPropsWithDropdown: ["role", "isActive"], // Auto-generated array
      };

      const result = await createUserMutation(userToCreate).unwrap();

      // Show success toast
      toast.success(`User "${result.name}" created successfully!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return result;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createUser,
    isCreating,
  };
};
