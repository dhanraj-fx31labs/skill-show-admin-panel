import type { Permission } from "#/entity";
import type { NavItemDataProps } from "@/components/nav/types";
import { GLOBAL_CONFIG } from "@/global-config";
import { useUserPermissions } from "@/store/userStore";
import { checkAny } from "@/utils";
import { flattenTrees } from "@/utils/tree";
import { useMemo } from "react";
import { backendNavData } from "./nav-data-backend";
import { frontendNavData } from "./nav-data-frontend";

const navData = GLOBAL_CONFIG.routerMode === "permission" ? backendNavData : frontendNavData;

/**
 * Build full route path from permission to root (e.g. /dashboard/workbench)
 */
function buildFullPath(permission: Permission, flat: Permission[], segments: string[] = []): string {
	const route = permission.route ?? "";
	if (route) segments.unshift(route);
	if (!permission.parentId) return `/${segments.join("/")}`;
	const parent = flat.find((p) => p.id === permission.parentId);
	if (!parent) return `/${segments.join("/")}`;
	return buildFullPath(parent, flat, segments);
}

/**
 * Get all allowed nav paths from permission tree (flatten and build full path per node)
 */
function getAllowedPathsFromTree(permissions: Permission[]): Set<string> {
	const flat = flattenTrees(permissions);
	const paths = new Set<string>();
	for (const p of flat) {
		const full = buildFullPath(p, flat);
		if (full && full !== "/") paths.add(full);
	}
	return paths;
}

/**
 * Filter nav items by permission codes (auth) and by allowed paths from permission tree
 */
const filterItems = (
	items: NavItemDataProps[],
	permissionCodes: string[],
	allowedPaths: Set<string> | null,
): NavItemDataProps[] => {
	return items.filter((item) => {
		const hasAuth = item.auth ? checkAny(item.auth, permissionCodes) : true;
		const hasPathAccess = !allowedPaths || !item.path || allowedPaths.has(item.path) || item.path === "/";

		if (item.children?.length) {
			const filteredChildren = filterItems(item.children, permissionCodes, allowedPaths);
			if (filteredChildren.length === 0) return false;
			item.children = filteredChildren;
		}

		return hasAuth && hasPathAccess;
	});
};

const filterNavData = (permissionCodes: string[], allowedPaths: Set<string> | null) => {
	return navData
		.map((group) => {
			const filteredItems = filterItems(group.items, permissionCodes, allowedPaths);
			if (filteredItems.length === 0) return null;
			return { ...group, items: filteredItems };
		})
		.filter((group): group is NonNullable<typeof group> => group !== null);
};

/**
 * Hook to get filtered navigation data based on user permissions.
 * When user has permission tree (with route/children), nav is filtered by allowed paths so test sees only their pages.
 */
export const useFilteredNavData = () => {
	const permissions = useUserPermissions();

	const permissionCodes = useMemo(
		() => permissions.map((p) => p.code ?? (p as { route?: string }).route ?? p.name).filter(Boolean),
		[permissions],
	);

	const allowedPaths = useMemo(() => {
		if (!permissions.length || !permissions.some((p) => (p as Permission).route != null)) return null;
		return getAllowedPathsFromTree(permissions as Permission[]);
	}, [permissions]);

	const filteredNavData = useMemo(() => filterNavData(permissionCodes, allowedPaths), [permissionCodes, allowedPaths]);

	return filteredNavData;
};
