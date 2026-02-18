import { Tag } from "antd";
import { isEmpty } from "ramda";
import { lazy, Suspense, useMemo } from "react";
import { Navigate, Outlet } from "react-router";
import type { Permission } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";
import type { AppRouteObject } from "#/router";
import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";
import { useUserPermission } from "@/store/userStore";
import { flattenTrees } from "@/utils/tree";
import { getRoutesFromModules } from "../utils";

const ENTRY_PATH = "/src/pages";
const ENTRY_PATH_NO_LEADING = "src/pages";
const PAGES = import.meta.glob<{ default: React.ComponentType }>("/src/pages/**/*.tsx");

function loadComponentFromPath(path: string): (() => Promise<{ default: React.ComponentType }>) | undefined {
	const normalized = path.replace(/^\//, "");
	const keysToTry = [
		`${ENTRY_PATH}/${normalized}`,
		`${ENTRY_PATH_NO_LEADING}/${normalized}`,
		path.startsWith("/") ? path : `/${path}`,
		path.startsWith("src/") ? path : `src/pages/${normalized}`,
	];
	for (const key of keysToTry) {
		const loader = PAGES[key];
		if (typeof loader === "function") return loader;
	}
	return undefined;
}

/**
 * Build complete route path by traversing from current permission to root
 * @param {Permission} permission - current permission
 * @param {Permission[]} flattenedPermissions - flattened permission array
 * @param {string[]} segments - route segments accumulator
 * @returns {string} normalized complete route path
 */
function buildCompleteRoute(
	permission: Permission,
	flattenedPermissions: Permission[],
	segments: string[] = [],
): string {
	// Add current route segment
	segments.unshift(permission.route as string);

	// Base case: reached root permission
	if (!permission.parentId) {
		return `/${segments.join("/")}`;
	}

	// Find parent and continue recursion
	const parent = flattenedPermissions.find((p) => p.id === permission.parentId);
	if (!parent) {
		console.warn(`Parent permission not found for ID: ${permission.parentId}`);
		return `/${segments.join("/")}`;
	}

	return buildCompleteRoute(parent, flattenedPermissions, segments);
}

// Components
function NewFeatureTag() {
	return (
		<Tag color="cyan" className="ml-2!">
			<div className="flex items-center gap-1">
				<Icon icon="solar:bell-bing-bold-duotone" size={12} />
				<span className="ms-1">NEW</span>
			</div>
		</Tag>
	);
}

// Route Transformers
const createBaseRoute = (permission: Permission, completeRoute: string): AppRouteObject => {
	const { route, label, icon, order, hide, hideTab, status, frameSrc, newFeature } = permission;

	const baseRoute: AppRouteObject = {
		path: route,
		meta: {
			label: label as string,
			key: completeRoute,
			hideMenu: !!hide,
			hideTab,
			disabled: status === BasicStatus.DISABLE,
		},
	};

	if (order) baseRoute.order = order;
	if (baseRoute.meta) {
		if (icon) baseRoute.meta.icon = icon;
		if (frameSrc) baseRoute.meta.frameSrc = frameSrc;
		if (newFeature) baseRoute.meta.suffix = <NewFeatureTag />;
	}

	return baseRoute;
};

const createCatalogueRoute = (permission: Permission, flattenedPermissions: Permission[]): AppRouteObject => {
	const baseRoute = createBaseRoute(permission, buildCompleteRoute(permission, flattenedPermissions));

	if (baseRoute.meta) {
		baseRoute.meta.hideTab = true;
	}

	const { parentId, children = [] } = permission;
	if (!parentId) {
		baseRoute.element = (
			<Suspense fallback={<LineLoading />}>
				<Outlet />
			</Suspense>
		);
	}

	baseRoute.children = transformPermissionsToRoutes(children, flattenedPermissions);

	if (!isEmpty(children)) {
		baseRoute.children.unshift({
			index: true,
			element: <Navigate to={children[0].route as string} replace />,
		});
	}

	return baseRoute;
};

const createMenuRoute = (permission: Permission, flattenedPermissions: Permission[]): AppRouteObject => {
	const baseRoute = createBaseRoute(permission, buildCompleteRoute(permission, flattenedPermissions));

	if (permission.component) {
		const componentPath =
			typeof permission.component === "string" && permission.component.startsWith("/")
				? permission.component.slice(1)
				: (permission.component as string);
		const loader = loadComponentFromPath(componentPath);
		if (loader) {
			const Element = lazy(loader);
			if (permission.frameSrc) {
				baseRoute.element = <Element {...({ src: permission.frameSrc } as object)} />;
			} else {
				baseRoute.element = (
					<Suspense fallback={<LineLoading />}>
						<Element />
					</Suspense>
				);
			}
		}
	}

	if (!baseRoute.element) {
		baseRoute.element = (
			<Suspense fallback={<LineLoading />}>
				<Outlet />
			</Suspense>
		);
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
export function usePermissionRoutes() {
	const permissions = useUserPermission();
	const permissionRoutes = useMemo(() => {
		if (ROUTE_MODE === "module") return getRoutesFromModules();
		if (!permissions) return [];
		const flattenedPermissions = flattenTrees(permissions);
		return transformPermissionsToRoutes(permissions, flattenedPermissions);
	}, [permissions]);

	return permissionRoutes;
}
