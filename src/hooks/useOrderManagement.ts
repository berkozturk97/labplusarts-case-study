import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateOrderMutation } from "../services/orders";
import type { Order } from "../types/api";
import type { OrderFormData } from "../components/OrderForm";

// Helper function to generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}${random}`;
};

export const useOrderManagement = () => {
  const [createOrderMutation] = useCreateOrderMutation();
  const [isCreating, setIsCreating] = useState(false);

  const createOrder = async (orderData: OrderFormData): Promise<Order> => {
    setIsCreating(true);

    try {
      // Auto-generate fields that the user shouldn't provide
      const orderToCreate = {
        ...orderData,
        orderNumber: generateOrderNumber(),
        orderDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        canBeFilteredPropsWithDropdown: ["status"], // Auto-generated array
      };

      const result = await createOrderMutation(orderToCreate).unwrap();

      // Show success toast
      toast.success(`Order "${result.orderNumber}" created successfully!`, {
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
    createOrder,
    isCreating,
  };
};
