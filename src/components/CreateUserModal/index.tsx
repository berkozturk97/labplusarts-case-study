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
      onSuccess?.(userData);
      onClose();
    } catch {
      console.error("Error creating user:", error);
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
      closeOnBackdropClick={!isCreating}
      closeOnEscape={!isCreating}
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
