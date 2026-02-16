import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";
import { useUserPermission } from "@/store/userStore";
import { flattenTrees } from "@/utils/tree";
import { isEmpty } from "ramda";
import { Suspense, lazy, useMemo } from "react";
import { Navigate, Outlet } from "react-router";
import type { Permission } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";
import type { AppRouteObject } from "#/router";
import { getRoutesFromModules } from "../utils";

const ENTRY_PATH = "/src/pages";
const PAGES = import.meta.glob("/src/pages/**/*.tsx");

function normalizePath(componentPath: string): string {
	return componentPath.startsWith("/pages")
		? `/src${componentPath}`
		: `${ENTRY_PATH}${componentPath.startsWith("/") ? componentPath : `/${componentPath}`}`;
}

/** Resolve lazy loader: try path.tsx then path/index.tsx; Vite glob keys may vary (/, no slash, ./) */
function loadComponentFromPath(componentPath: string) {
	const base = normalizePath(componentPath);
	const withoutExt = base.endsWith(".tsx") ? base.slice(0, -4) : base;
	const candidates = [`${withoutExt}.tsx`, `${withoutExt}/index.tsx`];
	const keys = new Set<string>();
	for (const c of candidates) {
		keys.add(c);
		keys.add(c.replace(/^\//, ""));
		keys.add(c.startsWith("/") ? `.${c}` : `./${c}`);
	}
	for (const key of keys) {
		const loader = PAGES[key];
		if (loader) return loader;
	}
	return undefined;
}

/**
 * Build complete route path by traversing from current permission to root
 */
function buildCompleteRoute(
	permission: Permission,
	flattenedPermissions: Permission[],
	segments: string[] = [],
): string {
	const segment = permission.route ?? "";
	if (segment) segments.unshift(segment);

	if (!permission.parentId) {
		return `/${segments.join("/")}`;
	}

	const parent = flattenedPermissions.find((p) => p.id === permission.parentId);
	if (!parent) {
		return `/${segments.join("/")}`;
	}

	return buildCompleteRoute(parent, flattenedPermissions, segments);
}

const createBaseRoute = (permission: Permission, completeRoute: string): AppRouteObject => {
	const { route, label, icon, order, hide, hideTab, status, frameSrc, newFeature } = permission;

	const baseRoute: AppRouteObject = {
		path: route ?? "",
		meta: {
			label: label ?? permission.name,
			key: completeRoute,
			hideMenu: !!hide,
			hideTab,
			disabled: status === BasicStatus.DISABLE,
		},
	};

	if (order !== undefined) baseRoute.order = order;
	if (baseRoute.meta) {
		if (icon) baseRoute.meta.icon = <Icon icon={icon} className="ant-menu-item-icon" size={24} />;
		if (frameSrc) baseRoute.meta.frameSrc = frameSrc;
		if (newFeature) baseRoute.meta.suffix = <span className="ml-2 text-cyan-600 text-xs">NEW</span>;
	}

	return baseRoute;
};

const createCatalogueRoute = (permission: Permission, flattenedPermissions: Permission[]): AppRouteObject => {
	const baseRoute = createBaseRoute(permission, buildCompleteRoute(permission, flattenedPermissions));

	if (baseRoute.meta) {
		baseRoute.meta.hideTab = true;
	}

	const children = permission.children ?? [];
	if (!permission.parentId) {
		baseRoute.element = (
			<Suspense fallback={<LineLoading />}>
				<Outlet />
			</Suspense>
		);
	}

	baseRoute.children = transformPermissionsToRoutes(children, flattenedPermissions);

	if (!isEmpty(children)) {
		const firstChildRoute = children[0].route ?? "";
		baseRoute.children?.unshift({
			index: true,
			element: <Navigate to={firstChildRoute} replace />,
		});
	}

	return baseRoute;
};

const createMenuRoute = (permission: Permission, flattenedPermissions: Permission[]): AppRouteObject => {
	const baseRoute = createBaseRoute(permission, buildCompleteRoute(permission, flattenedPermissions));

	if (permission.component) {
		const loader = loadComponentFromPath(permission.component) as
			| (() => Promise<{ default: React.ComponentType }>)
			| undefined;
		if (loader) {
			const Element = lazy(loader);
			if (permission.frameSrc) {
				baseRoute.element = <Element />;
			} else {
				baseRoute.element = (
					<Suspense fallback={<LineLoading />}>
						<Element />
					</Suspense>
				);
			}
		}
	}

	return baseRoute;
};

function transformPermissionsToRoutes(permissions: Permission[], flattenedPermissions: Permission[]): AppRouteObject[] {
	return permissions.map((permission) => {
		if (permission.type === PermissionType.CATALOGUE) {
			return createCatalogueRoute(permission, flattenedPermissions);
		}
		return createMenuRoute(permission, flattenedPermissions);
	});
}

const ROUTE_MODE = import.meta.env.VITE_APP_ROUTER_MODE;

/**
 * Returns route config for the protected layout.
 * - "module": static routes from src/router/routes/modules
 * - "permission": routes built from user permission tree
 */
export function usePermissionRoutes(): AppRouteObject[] {
	const permissions = useUserPermission();

	return useMemo(() => {
		if (ROUTE_MODE === "module") {
			return getRoutesFromModules();
		}
		if (!permissions?.length) return [];

		const flattenedPermissions = flattenTrees(permissions);
		return transformPermissionsToRoutes(permissions, flattenedPermissions);
	}, [permissions]);
}
