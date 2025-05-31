// Route constants to avoid hardcoded strings
export const ROUTES = {
  HOME: "/",
  ORDERS: "/orders",
  USERS: "/users",
} as const;

// Type for route keys
export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
