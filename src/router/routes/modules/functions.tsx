import { Suspense, lazy } from "react";
import { Navigate, Outlet } from "react-router";

import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const ClipboardPage = lazy(() => import("@/pages/functions/clipboard"));
const TokenExpiredPage = lazy(() => import("@/pages/functions/token-expired"));

const functions: AppRouteObject = {
	order: 4,
	path: "functions",
	element: (
		<Suspense fallback={<LineLoading />}>
			<Outlet />
		</Suspense>
	),
	meta: {
		label: "sys.menu.functions",
		icon: <Icon icon="local:ic-functions" className="ant-menu-item-icon" size="24" />,
		key: "/functions",
	},
	children: [
		{
			index: true,
			element: <Navigate to="clipboard" replace />,
		},
		{
			path: "clipboard",
			element: <ClipboardPage />,
			meta: { label: "sys.menu.functions.clipboard", key: "/functions/clipboard" },
		},
		{
			path: "token_expired",
			element: <TokenExpiredPage />,
			meta: { label: "sys.menu.functions.tokenExpired", key: "/functions/token_expired" },
		},
	],
};

export default functions;
