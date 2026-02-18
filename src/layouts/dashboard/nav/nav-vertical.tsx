import { Layout, Menu, type MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useMatches, useNavigate } from "react-router";

import { useFlattenedRoutes, usePathname, usePermissionRoutes, useRouteToMenuFn } from "@/router/hooks";
import { menuFilter } from "@/router/utils";
import { useSettingActions, useSettings } from "@/store/settingStore";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";

import { NAV_WIDTH } from "../config";

import NavLogo from "./nav-logo";

import { ThemeLayout, ThemeMode } from "#/enum";

const { Sider } = Layout;

type Props = {
	closeSideBarDrawer?: () => void;
	/** When true, render for mobile drawer (no Sider, no collapse) */
	isDrawer?: boolean;
};
export default function NavVertical(props: Props) {
	const navigate = useNavigate();
	const matches = useMatches();
	const pathname = usePathname();

	const settings = useSettings();
	const { themeLayout, themeMode, darkSidebar } = settings;
	const { setSettings } = useSettingActions();

	const routeToMenuFn = useRouteToMenuFn();
	const permissionRoutes = usePermissionRoutes();
	const flattenedRoutes = useFlattenedRoutes();

	const collapsed = useMemo(() => themeLayout === ThemeLayout.Mini, [themeLayout]);

	const menuList = useMemo(() => {
		const menuRoutes = menuFilter(permissionRoutes);
		return routeToMenuFn(menuRoutes);
	}, [routeToMenuFn, permissionRoutes]);

	const [selectedKeys, setSelectedKeys] = useState([pathname]);
	const [openKeys, setOpenKeys] = useState<string[]>(() => {
		if (!collapsed) {
			const keys = matches
				.filter((match) => match.pathname !== "/" && match.pathname !== pathname)
				.map((match) => match.pathname);
			return keys;
		}
		return [];
	});

	// Sync sidebar selection when route changes (e.g. clicking a multi-tab)
	useEffect(() => {
		setSelectedKeys([pathname]);
	}, [pathname]);

	// Sync open submenus when route/matches change
	useEffect(() => {
		if (!collapsed) {
			const keys = matches
				.filter((match) => match.pathname !== "/" && match.pathname !== pathname)
				.map((match) => match.pathname);
			setOpenKeys(keys);
		}
	}, [pathname, matches, collapsed]);

	const handleToggleCollapsed = () => {
		setSettings({
			...settings,
			themeLayout: collapsed ? ThemeLayout.Vertical : ThemeLayout.Mini,
		});
		if (collapsed) {
			const keys = matches
				.filter((match) => match.pathname !== "/" && match.pathname !== pathname)
				.map((match) => match.pathname);
			// hack resolution of https://github.com/d3george/slash-admin/issues/104
			setTimeout(() => {
				setOpenKeys(keys);
			}, 0);
			return;
		}
	};

	const onClick: MenuProps["onClick"] = ({ key }) => {
		const nextLink = flattenedRoutes?.find((e) => e.key === key);
		if (nextLink?.hideTab && nextLink?.frameSrc) {
			window.open(nextLink?.frameSrc, "_blank");
			return;
		}

		setSelectedKeys([key]);
		navigate(key);
		props?.closeSideBarDrawer?.();
	};

	const handleOpenChange: MenuProps["onOpenChange"] = (keys) => {
		if (!settings.accordion) {
			setOpenKeys(keys);
			return;
		}

		// 手风琴模式

		const latestOpenKey = keys.find((key) => !openKeys.includes(key));
		// 收起
		if (!latestOpenKey) {
			const closedKey = openKeys.find((key) => !keys.includes(key));
			if (closedKey) {
				// 只移除被收起的菜单，保留其他展开状态
				setOpenKeys(openKeys.filter((key) => key !== closedKey));
			}
			return;
		}
		// 展开
		const getKeyLevel = (key: string) => (key.match(/\//g) || []).length;
		const latestKeyLevel = getKeyLevel(latestOpenKey);
		// 过滤掉同层级的其他 key，保留不同层级的 key
		const newOpenKeys = openKeys.filter((key) => getKeyLevel(key) !== latestKeyLevel);

		// 找到当前打开菜单的所有父级路径
		const parentKeys = matches
			.filter(
				(match) =>
					latestOpenKey.startsWith(match.pathname) && match.pathname !== "/" && match.pathname !== latestOpenKey,
			)
			.map((match) => match.pathname);

		setOpenKeys([...new Set([...parentKeys, ...newOpenKeys, latestOpenKey])]);
	};

	const sidebarTheme = useMemo(() => {
		if (themeMode === ThemeMode.Dark) {
			return darkSidebar ? "light" : "dark";
		}
		return darkSidebar ? "dark" : "light";
	}, [themeMode, darkSidebar]);

	const content = (
		<div className="flex h-full flex-col min-h-0">
			<NavLogo
				collapsed={collapsed}
				onToggle={handleToggleCollapsed}
				variant={props.isDrawer ? "drawer" : "sidebar"}
				rightSlot={
					props.isDrawer && props.closeSideBarDrawer ? (
						<Button
							variant="ghost"
							size="icon"
							className="size-9 rounded-lg shrink-0"
							onClick={props.closeSideBarDrawer}
							aria-label="Close menu"
						>
							<Icon icon="solar:close-circle-bold" size={22} />
						</Button>
					) : undefined
				}
			/>
			<Menu
				mode="inline"
				items={menuList}
				theme={sidebarTheme}
				selectedKeys={selectedKeys}
				openKeys={openKeys}
				onOpenChange={handleOpenChange}
				className="border-none! min-h-0 flex-1 overflow-y-auto"
				onClick={onClick}
			/>
		</div>
	);

	if (props.isDrawer) {
		return <div className="flex h-full flex-col bg-background">{content}</div>;
	}

	return (
		<Sider
			trigger={null}
			collapsible
			collapsed={collapsed}
			width={NAV_WIDTH}
			theme={sidebarTheme}
			className="fixed! left-0 top-0 h-screen border-r border-dashed"
		>
			{content}
		</Sider>
	);
}
