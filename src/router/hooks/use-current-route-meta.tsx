import { isEmpty } from "ramda";
import { useEffect, useState } from "react";
import { useMatches, useOutlet } from "react-router";

import { replaceDynamicParams } from "../utils";
import { useFlattenedRoutes } from "./use-flattened-routes";
import { useRouter } from "./use-router";

import type { RouteMeta } from "#/router";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;
/**
 * 返回当前路由Meta信息
 */
export function useCurrentRouteMeta() {
	const { push } = useRouter();

	const children = useOutlet();

	const matchs = useMatches();

	const flattenedRoutes = useFlattenedRoutes();

	const [currentRouteMeta, setCurrentRouteMeta] = useState<RouteMeta>();

	useEffect(() => {
		const lastRoute = matchs.at(-1);
		if (!lastRoute) return;

		const { pathname, params } = lastRoute;
		const matchedRouteMeta = flattenedRoutes.find((item) => {
			const replacedKey = replaceDynamicParams(item.key, params);
			return replacedKey === pathname || `${replacedKey}/` === pathname;
		});

		if (matchedRouteMeta) {
			matchedRouteMeta.outlet = children;
			if (!isEmpty(params)) {
				matchedRouteMeta.params = params;
			}
			setCurrentRouteMeta({ ...matchedRouteMeta });
		} else {
			push(HOMEPAGE);
		}
	}, [matchs, flattenedRoutes, children, push]);

	return currentRouteMeta;
}
