import React from "react";
import Modal from "../Modal";
import OrderForm from "../OrderForm";
import { useOrderManagement } from "../../hooks/useOrderManagement";
import type { OrderFormData } from "../OrderForm";

export interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orderData: OrderFormData) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createOrder, isCreating, error } = useOrderManagement();

  const handleSubmit = async (orderData: OrderFormData): Promise<void> => {
    try {
      await createOrder(orderData);
      onSuccess?.(orderData);
      onClose();
    } catch {
      console.error("Error creating order:", error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      size="medium"
      closeOnBackdropClick={!isCreating} // Prevent closing while creating
      closeOnEscape={!isCreating} // Prevent escape while creating
    >
      <OrderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
        submitButtonText="Create Order"
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

export default CreateOrderModal;
