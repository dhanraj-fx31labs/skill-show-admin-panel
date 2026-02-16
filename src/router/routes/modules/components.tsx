import { Suspense, lazy } from "react";
import { Navigate, Outlet } from "react-router";

import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const AnimatePage = lazy(() => import("@/pages/components/animate"));
const ScrollPage = lazy(() => import("@/pages/components/scroll"));
const MultiLanguagePage = lazy(() => import("@/pages/components/multi-language"));
const IconPage = lazy(() => import("@/pages/components/icon"));
const UploadPage = lazy(() => import("@/pages/components/upload"));
const ChartPage = lazy(() => import("@/pages/components/chart"));
const ToastPage = lazy(() => import("@/pages/components/toast"));

const components: AppRouteObject = {
	order: 3,
	path: "components",
	element: (
		<Suspense fallback={<LineLoading />}>
			<Outlet />
		</Suspense>
	),
	meta: {
		label: "sys.menu.components",
		icon: <Icon icon="local:ic-components" className="ant-menu-item-icon" size="24" />,
		key: "/components",
	},
	children: [
		{
			index: true,
			element: <Navigate to="animate" replace />,
		},
		{
			path: "animate",
			element: <AnimatePage />,
			meta: { label: "sys.menu.components.animate", key: "/components/animate" },
		},
		{
			path: "scroll",
			element: <ScrollPage />,
			meta: { label: "sys.menu.components.scroll", key: "/components/scroll" },
		},
		{
			path: "multi-language",
			element: <MultiLanguagePage />,
			meta: { label: "sys.menu.components.multiLanguage", key: "/components/multi-language" },
		},
		{
			path: "icon",
			element: <IconPage />,
			meta: { label: "sys.menu.components.icon", key: "/components/icon" },
		},
		{
			path: "upload",
			element: <UploadPage />,
			meta: { label: "sys.menu.components.upload", key: "/components/upload" },
		},
		{
			path: "chart",
			element: <ChartPage />,
			meta: { label: "sys.menu.components.chart", key: "/components/chart" },
		},
		{
			path: "toast",
			element: <ToastPage />,
			meta: { label: "sys.menu.components.toast", key: "/components/toast" },
		},
	],
};

export default components;
