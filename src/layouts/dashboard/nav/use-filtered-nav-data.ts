import { useMemo } from "react";
import type { AppRouteObject } from "#/router";
import type { NavItemDataProps } from "@/components/nav";
import { usePermissionRoutes } from "@/router/hooks";
import { menuFilter } from "@/router/utils";

function routeToNavItems(routes: AppRouteObject[]): NavItemDataProps[] {
	return routes
		.filter((item) => item.meta?.key && !item.meta?.hideMenu)
		.map((item) => {
			const { meta, children } = item;
			const navItem: NavItemDataProps = {
				path: meta?.key ?? "",
				title: (meta?.label as string) ?? "",
			};
			if (children?.length) {
				navItem.children = routeToNavItems(children);
			}
			return navItem;
		});
}

/**
 * Returns nav data derived from permission routes for search bar and breadcrumbs.
 * Single section containing all menu items (filtered, no hideMenu).
 */
export function useFilteredNavData(): Array<{ items: NavItemDataProps[] }> {
	const permissionRoutes = usePermissionRoutes();

	return useMemo(() => {
		const menuRoutes = menuFilter(permissionRoutes);
		const items = routeToNavItems(menuRoutes);
		return [{ items }];
	}, [permissionRoutes]);
}
