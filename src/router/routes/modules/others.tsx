import { Suspense, lazy } from "react";
import { Navigate, Outlet } from "react-router";

import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const IframePage = lazy(() => import("@/pages/sys/others/link/iframe"));
const ExternalLinkPage = lazy(() => import("@/pages/sys/others/link/external-link"));
const PermissionPage = lazy(() => import("@/pages/sys/others/permission"));
const PermissionTestPage = lazy(() => import("@/pages/sys/others/permission/page-test"));
const CalendarPage = lazy(() => import("@/pages/sys/others/calendar"));
const KanbanPage = lazy(() => import("@/pages/sys/others/kanban"));
const BlankPage = lazy(() => import("@/pages/sys/others/blank"));

const others: AppRouteObject[] = [
	{
		order: 5,
		path: "link",
		element: (
			<Suspense fallback={<LineLoading />}>
				<Outlet />
			</Suspense>
		),
		meta: {
			label: "sys.menu.link",
			icon: <Icon icon="local:ic-link" className="ant-menu-item-icon" size="24" />,
			key: "/link",
		},
		children: [
			{
				index: true,
				element: <Navigate to="iframe" replace />,
			},
			{
				path: "iframe",
				element: <IframePage src="https://ant.design/index-cn" />,
				meta: { label: "sys.menu.link.iframe", key: "/link/iframe" },
			},
			{
				path: "external-link",
				element: <ExternalLinkPage src="https://ant.design/index-cn" />,
				meta: { label: "sys.menu.link.externalLink", key: "/link/external-link" },
			},
		],
	},
	{
		order: 7,
		path: "permission",
		meta: {
			label: "sys.menu.permission",
			icon: <Icon icon="local:ic-permission" className="ant-menu-item-icon" size="24" />,
			key: "/permission",
		},
		children: [
			{
				index: true,
				element: <PermissionPage />,
				meta: { label: "sys.menu.permission.index", key: "/permission" },
			},
			{
				path: "page-test",
				element: <PermissionTestPage />,
				meta: { label: "sys.menu.permission.pageTest", key: "/permission/page-test" },
			},
		],
	},
	{
		order: 8,
		path: "calendar",
		element: <CalendarPage />,
		meta: { label: "sys.menu.calendar", key: "/calendar" },
	},
	{
		order: 9,
		path: "kanban",
		element: <KanbanPage />,
		meta: { label: "sys.menu.kanban", key: "/kanban" },
	},
	{
		order: 10,
		path: "blank",
		element: <BlankPage />,
		meta: { label: "sys.menu.blank", key: "/blank" },
	},
];

export default others;
