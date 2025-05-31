import React, { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import PageLoader from "../components/PageLoader";

// Lazy load components for better performance
const HomePage = lazy(() => import("../pages/HomePage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const UsersPage = lazy(() => import("../pages/UsersPage"));

// Route configuration with metadata
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  icon?: string;
}

export const routeConfig: RouteConfig[] = [
  {
    path: ROUTES.HOME,
    element: (
      <Suspense fallback={<PageLoader text="Loading Dashboard..." />}>
        <HomePage />
      </Suspense>
    ),
    title: "Dashboard",
    description: "Main dashboard overview",
    icon: "🏠",
  },
  {
    path: ROUTES.ORDERS,
    element: (
      <Suspense fallback={<PageLoader text="Loading Orders..." />}>
        <OrdersPage />
      </Suspense>
    ),
    title: "Orders",
    description: "Check customer orders",
    icon: "📦",
  },
  {
    path: ROUTES.USERS,
    element: (
      <Suspense fallback={<PageLoader text="Loading Users..." />}>
        <UsersPage />
      </Suspense>
    ),
    title: "Users",
    description: "Check user accounts",
    icon: "👫",
  },
];

// Navigation items (for header/sidebar)
export const navigationItems = routeConfig.map(route => ({
  path: route.path,
  title: route.title!,
  icon: route.icon!,
  description: route.description,
}));

// Convert to React Router format
export const reactRouterConfig: RouteObject[] = routeConfig.map(route => ({
  path: route.path,
  element: route.element,
}));
