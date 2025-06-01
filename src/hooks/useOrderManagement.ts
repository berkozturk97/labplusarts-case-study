import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateOrderMutation } from "../services/orders";
import type { OrderFormData } from "../components/OrderForm";
import type { Order } from "../types/api";

export interface UseOrderManagementResult {
  createOrder: (orderData: OrderFormData) => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const suffix = timestamp.toString().slice(-6);
  return `ORD-${suffix}`;
};

export const useOrderManagement = (): UseOrderManagementResult => {
  const [createOrderMutation, { isLoading: isCreating }] = useCreateOrderMutation();
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: OrderFormData): Promise<void> => {
    try {
      setError(null);

      const newOrder: Omit<Order, "id"> = {
        ...orderData,
        orderNumber: generateOrderNumber(),
        orderDate: new Date().toISOString().split("T")[0],
        canBeFilteredPropsWithDropdown: ["customer", "status"],
      };

      await createOrderMutation(newOrder).unwrap();

      toast.success(`Order "${newOrder.orderNumber}" for ${orderData.customer} has been created successfully!`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to create order. Please try again.";

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

      setError(errorMessage);

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
    createOrder,
    isCreating,
    error,
  };
};
