import { Suspense, lazy } from "react";
import { Navigate, Outlet } from "react-router";

import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const MenuLevel1APage = lazy(() => import("@/pages/menu-level/menu-level-1a"));
const MenuLevel2APage = lazy(() => import("@/pages/menu-level/menu-level-1b/menu-level-2a"));
const MenuLevel3APage = lazy(() => import("@/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3a"));
const MenuLevel3BPage = lazy(() => import("@/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3b"));

const menulevel: AppRouteObject = {
	order: 11,
	path: "menu_level",
	element: (
		<Suspense fallback={<LineLoading />}>
			<Outlet />
		</Suspense>
	),
	meta: {
		label: "sys.menu.menuLevel",
		icon: <Icon icon="local:ic-menu-level" className="ant-menu-item-icon" size="24" />,
		key: "/menu_level",
	},
	children: [
		{
			index: true,
			element: <Navigate to="1a" replace />,
		},
		{
			path: "1a",
			element: <MenuLevel1APage />,
			meta: { label: "sys.menu.menuLevel.1a", key: "/menu_level/1a" },
		},
		{
			path: "1b",
			element: (
				<Suspense fallback={<LineLoading />}>
					<Outlet />
				</Suspense>
			),
			meta: { label: "sys.menu.menuLevel.1b", key: "/menu_level/1b" },
			children: [
				{
					index: true,
					element: <Navigate to="2a" replace />,
				},
				{
					path: "2a",
					element: <MenuLevel2APage />,
					meta: { label: "sys.menu.menuLevel.2a", key: "/menu_level/1b/2a" },
				},
				{
					path: "2b",
					element: (
						<Suspense fallback={<LineLoading />}>
							<Outlet />
						</Suspense>
					),
					meta: { label: "sys.menu.menuLevel.2b", key: "/menu_level/1b/2b" },
					children: [
						{
							index: true,
							element: <Navigate to="3a" replace />,
						},
						{
							path: "3a",
							element: <MenuLevel3APage />,
							meta: { label: "sys.menu.menuLevel.3a", key: "/menu_level/1b/2b/3a" },
						},
						{
							path: "3b",
							element: <MenuLevel3BPage />,
							meta: { label: "sys.menu.menuLevel.3b", key: "/menu_level/1b/2b/3b" },
						},
					],
				},
			],
		},
	],
};

export default menulevel;
