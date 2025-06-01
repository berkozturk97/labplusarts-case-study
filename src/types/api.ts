// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "User";
  createdAt: string;
  isActive: boolean;
}

// Order interface
export interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  orderDate: string;
  total: number;
  canBeFilteredPropsWithDropdown?: string[]; // Fields that can be filtered with dropdown
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create/Update interfaces
export type CreateUserDto = Omit<User, "id" | "createdAt">;

export type CreateOrderDto = Omit<Order, "id">;
