import React from "react";
import Modal from "../Modal";
import UserForm from "../UserForm";
import { useUserManagement } from "../../hooks/useUserManagement";
import type { UserFormData } from "../UserForm";

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userData: UserFormData) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createUser, isCreating, error } = useUserManagement();

  const handleSubmit = async (userData: UserFormData): Promise<void> => {
    try {
      await createUser(userData);
      // Call onSuccess callback if provided
      onSuccess?.(userData);
      // Close the modal on successful creation
      onClose();
    } catch {
      // Error is already handled in useUserManagement hook with toast
      // Form will remain open for user to retry or fix issues
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New User"
      size="medium"
      closeOnBackdropClick={!isCreating} // Prevent closing while creating
      closeOnEscape={!isCreating} // Prevent escape while creating
    >
      <UserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
        submitButtonText="Create User"
        showCancelButton={true}
      />

      {/* Display error if any (though it's also shown in toast) */}
      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#dc2626",
            fontSize: "0.875rem",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </Modal>
  );
};

export default CreateUserModal;
