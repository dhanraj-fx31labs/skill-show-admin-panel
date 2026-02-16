import { Suspense, lazy } from "react";
import { Navigate, Outlet } from "react-router";

import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";

import type { AppRouteObject } from "#/router";

const ProfilePage = lazy(() => import("@/pages/management/user/profile"));
const AccountPage = lazy(() => import("@/pages/management/user/account"));

const PermissioPage = lazy(() => import("@/pages/management/system/permission"));
const RolePage = lazy(() => import("@/pages/management/system/role"));
const UserPage = lazy(() => import("@/pages/management/system/user"));
const UserDetailPage = lazy(() => import("@/pages/management/system/user/detail"));

const management: AppRouteObject = {
	order: 2,
	path: "management",
	element: (
		<Suspense fallback={<LineLoading />}>
			<Outlet />
		</Suspense>
	),
	meta: {
		label: "sys.menu.management",
		icon: <Icon icon="local:ic-management" className="ant-menu-item-icon" size="24" />,
		key: "/management",
	},
	children: [
		{
			index: true,
			element: <Navigate to="user" replace />,
		},
		{
			path: "user",
			meta: { label: "sys.menu.user.index", key: "/management/user" },
			children: [
				{
					index: true,
					element: <Navigate to="profile" replace />,
				},
				{
					path: "profile",
					element: <ProfilePage />,
					meta: {
						label: "sys.menu.user.profile",
						key: "/management/user/profile",
					},
				},
				{
					path: "account",
					element: <AccountPage />,
					meta: {
						label: "sys.menu.user.account",
						key: "/management/user/account",
					},
				},
			],
		},
		{
			path: "system",
			meta: { label: "sys.menu.system.index", key: "/management/system" },
			children: [
				{
					index: true,
					element: <Navigate to="permission" replace />,
				},
				{
					path: "permission",
					element: <PermissioPage />,
					meta: {
						label: "sys.menu.system.permission",
						key: "/management/system/permission",
					},
				},
				{
					path: "role",
					element: <RolePage />,
					meta: {
						label: "sys.menu.system.role",
						key: "/management/system/role",
					},
				},
				{
					path: "user",
					element: <UserPage />,
					meta: {
						label: "sys.menu.system.user",
						key: "/management/system/user",
					},
				},
				{
					path: "user/:id",
					element: <UserDetailPage />,
					meta: {
						label: "sys.menu.system.user_detail",
						key: "/management/system/user/:id",
						hideMenu: true,
					},
				},
			],
		},
	],
};

export default management;
