import { ErrorBoundary } from "react-error-boundary";
import { createHashRouter, Navigate, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import type { AppRouteObject } from "#/router";
import DashboardLayout from "@/layouts/dashboard";
import Page500 from "@/pages/sys/error/Page500";
import Login from "@/pages/sys/login";
import ProtectedRoute from "@/router/components/protected-route";
import { usePermissionRoutes } from "@/router/hooks";
import { ERROR_ROUTE } from "@/router/routes/error-routes";

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? "/dashboard/workbench";

const PUBLIC_ROUTE: AppRouteObject[] = [
	{
		path: "/login",
		element: (
			<ErrorBoundary FallbackComponent={Page500}>
				<Login />
			</ErrorBoundary>
		),
	},
];

const NO_MATCHED_ROUTE: AppRouteObject = {
	path: "*",
	element: <Navigate to="/404" replace />,
};

export default function Router() {
	const permissionRoutes = usePermissionRoutes();

	const PROTECTED_ROUTE: AppRouteObject = {
		path: "/",
		element: (
			<ProtectedRoute>
				<DashboardLayout />
			</ProtectedRoute>
		),
		children: [{ index: true, element: <Navigate to={HOMEPAGE} replace /> }, ...permissionRoutes],
	};

	const routes = [...PUBLIC_ROUTE, PROTECTED_ROUTE, ERROR_ROUTE, NO_MATCHED_ROUTE] as RouteObject[];

	const router = createHashRouter(routes);

	return <RouterProvider router={router} />;
}
