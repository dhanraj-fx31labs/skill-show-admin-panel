import { isEmpty } from "ramda";
import { useEffect, useState } from "react";
import { type Params, useMatches, useOutlet } from "react-router";

import { useFlattenedRoutes } from "./use-flattened-routes";
import { useRouter } from "./use-router";

import type { RouteMeta } from "#/router";

const { VITE_APP_HOMEPAGE } = import.meta.env;

/**
 * Returns the meta information of the currently active route.
 */
export function useCurrentRouteMeta(): RouteMeta | undefined {
  const { push } = useRouter();

  // Current rendered outlet (child route component)
  const outlet = useOutlet();

  // All matched routes from react-router
  const matches = useMatches();

  // Flattened route configuration (custom hook)
  const flattenedRoutes = useFlattenedRoutes();

  const [currentRouteMeta, setCurrentRouteMeta] = useState<RouteMeta>();

  useEffect(() => {
    // Get the last matched route (deepest active route)
    const lastRoute = matches.at(-1);
    if (!lastRoute) return;

    const { pathname, params } = lastRoute;

    // Find the corresponding route meta from flattened routes
    const matchedRouteMeta = flattenedRoutes.find((route) => {
      const replacedKey = replaceDynamicParams(route.key, params);
      return replacedKey === pathname || `${replacedKey}/` === pathname;
    });

    if (matchedRouteMeta) {
      // Create a new object to avoid mutating original route config
      const updatedMeta: RouteMeta = {
        ...matchedRouteMeta,
        outlet,
        ...(params && !isEmpty(params) ? { params } : {}),
      };

      setCurrentRouteMeta(updatedMeta);
    } else {
      // Redirect to homepage if route not found
      if (VITE_APP_HOMEPAGE) {
        push(VITE_APP_HOMEPAGE);
      }
    }
  }, [matches, flattenedRoutes, outlet, push]);

  return currentRouteMeta;
}

/**
 * Replace dynamic route parameters.
 *
 * Example:
 *  Input:  "/user/:id"
 *  Params: { id: "123" }
 *  Output: "/user/123"
 */
export function replaceDynamicParams(
  routeKey: string,
  params: Params<string>
): string {
  let replacedPathName = routeKey;

  const paramNames = routeKey.match(/:\w+/g);
  if (!paramNames) return replacedPathName;

  for (const paramName of paramNames) {
    const paramKey = paramName.slice(1);
    const paramValue = params[paramKey];

    if (!paramValue) continue;

    replacedPathName = replacedPathName.replace(paramName, paramValue);
  }

  return replacedPathName;
}