import { ascend } from "ramda";
import type { Params } from "react-router";

import type { AppRouteObject, RouteMeta } from "#/router";

/**
 * Replace dynamic segments in path: `user/:id` + params → `user/123`
 */
export function replaceDynamicParams(menuKey: string, params: Params<string>) {
	let replacedPathName = menuKey;
	const paramNames = menuKey.match(/:\w+/g);
	if (paramNames) {
		for (const paramName of paramNames) {
			const paramKey = paramName.slice(1);
			const value = params[paramKey];
			if (value == null) continue;
			replacedPathName = replacedPathName.replace(paramName, value);
		}
	}
	return replacedPathName;
}

/**
 * return menu routes
 */
export const menuFilter = (items: AppRouteObject[]) => {
	return items
		.filter((item) => {
			const show = item.meta?.key;
			if (show && item.children) {
				item.children = menuFilter(item.children);
			}
			return show;
		})
		.sort(ascend((item) => item.order || Number.POSITIVE_INFINITY));
};

/**
 * Dynamically generate routes based on src/router/routes/modules file structure
 */
export function getRoutesFromModules() {
	const menuModules: AppRouteObject[] = [];

	const modules = import.meta.glob("./routes/modules/**/*.tsx", {
		eager: true,
	});
	for (const key in modules) {
		const mod = (modules as any)[key].default || {};
		const modList = Array.isArray(mod) ? [...mod] : [mod];
		menuModules.push(...modList);
	}
	return menuModules;
}

/**
 * return the routes will be used in sidebar menu
 */
export function getMenuRoutes(appRouteObjects: AppRouteObject[]) {
	return menuFilter(appRouteObjects);
}

/**
 * return flatten routes
 */
export function flattenMenuRoutes(routes: AppRouteObject[]) {
	return routes.reduce<RouteMeta[]>((prev, item) => {
		const { meta, children } = item;
		if (meta) prev.push(meta);
		if (children) prev.push(...flattenMenuRoutes(children));
		return prev;
	}, []);
}
