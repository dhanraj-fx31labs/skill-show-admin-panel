import { Icon } from "@/components/icon";
import { LineLoading } from "@/components/loading";
import { useUserPermission } from "@/store/userStore";
import { flattenTrees } from "@/utils/tree";
import { Tag } from "antd";
import { Suspense, lazy, useMemo, type ReactNode, type ComponentType } from "react";
import { Navigate, Outlet } from "react-router";
import type { Permission } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";
import type { AppRouteObject } from "#/router";
import { getRoutesFromModules } from "../utils";

/**
 * Base path for dynamic page imports
 */
const ENTRY_PATH = "/src/pages";

/**
 * Strictly typed Vite dynamic imports
 */
const PAGES = import.meta.glob<{ default: ComponentType<any> }>(
  "/src/pages/**/*.tsx"
);

/**
 * Safely load component from dynamic path
 */
function loadComponentFromPath(path: string) {
  return PAGES[`${ENTRY_PATH}${path}`];
}

/**
 * Recursively build full route path from current permission up to root.
 *
 * Example:
 *  parent -> child -> subchild
 *  returns: /parent/child/subchild
 */
function buildCompleteRoute(
  permission: Permission,
  flattenedPermissions: Permission[],
  segments: string[] = []
): string {
  segments.unshift(permission.route as string);

  if (!permission.parentId) {
    return `/${segments.join("/")}`;
  }

  const parent = flattenedPermissions.find(
    (p) => p.id === permission.parentId
  );

  if (!parent) {
    console.warn(
      `Parent permission not found for ID: ${permission.parentId}`
    );
    return `/${segments.join("/")}`;
  }

  return buildCompleteRoute(parent, flattenedPermissions, segments);
}

/**
 * Tag component shown when feature is marked as new.
 */
function NewFeatureTag(): ReactNode {
  return (
    <Tag color="cyan" className="ml-2!">
      <div className="flex items-center gap-1">
        <Icon icon="solar:bell-bing-bold-duotone" size={12} />
        <span className="ms-1">NEW</span>
      </div>
    </Tag>
  );
}

/**
 * Create base route structure shared by catalogue and menu routes.
 */
function createBaseRoute(
  permission: Permission,
  completeRoute: string
): AppRouteObject {
  const {
    route,
    label,
    icon,
    order,
    hide,
    hideTab,
    status,
    frameSrc,
    newFeature,
  } = permission;

  const baseRoute: AppRouteObject = {
    path: route,
    meta: {
      label:label as string,
      key: completeRoute,
      hideMenu: Boolean(hide),
      hideTab,
      disabled: status === BasicStatus.DISABLE,
    },
  };

  if (order) baseRoute.order = order;

  if (icon) baseRoute.meta!.icon = icon;
  if (frameSrc) baseRoute.meta!.frameSrc = frameSrc;
  if (newFeature) baseRoute.meta!.suffix = <NewFeatureTag />;

  return baseRoute;
}

/**
 * Create route for catalogue-type permission (folder-like route).
 */
function createCatalogueRoute(
  permission: Permission,
  flattenedPermissions: Permission[]
): AppRouteObject {
  const baseRoute = createBaseRoute(
    permission,
    buildCompleteRoute(permission, flattenedPermissions)
  );

  baseRoute.meta!.hideTab = true;

  const { parentId, children = [] } = permission;

  if (!parentId) {
    baseRoute.element = (
      <Suspense fallback={<LineLoading />}>
        <Outlet />
      </Suspense>
    );
  }

  baseRoute.children = transformPermissionsToRoutes(
    children,
    flattenedPermissions
  );

  if (children.length > 0) {
    baseRoute.children.unshift({
      index: true,
      element: <Navigate to={children[0].route as string} replace />,
    });
  }

  return baseRoute;
}

/**
 * Create route for menu-type permission (leaf route).
 */
function createMenuRoute(
  permission: Permission,
  flattenedPermissions: Permission[]
): AppRouteObject {
  const baseRoute = createBaseRoute(
    permission,
    buildCompleteRoute(permission, flattenedPermissions)
  );

  if (permission.component) {
    const loader = loadComponentFromPath(permission.component);

    if (loader) {
      const Element = lazy(loader);

      baseRoute.element = permission.frameSrc ? (
        <Element src={permission.frameSrc} />
      ) : (
        <Suspense fallback={<LineLoading />}>
          <Element />
        </Suspense>
      );
    } else {
      console.error(
        `Component not found for path: ${permission.component}`
      );
    }
  }

  return baseRoute;
}

/**
 * Transform permission tree into React Router route objects.
 */
function transformPermissionsToRoutes(
  permissions: Permission[],
  flattenedPermissions: Permission[]
): AppRouteObject[] {
  return permissions.map((permission) =>
    permission.type === PermissionType.CATALOGUE
      ? createCatalogueRoute(permission, flattenedPermissions)
      : createMenuRoute(permission, flattenedPermissions)
  );
}

const ROUTE_MODE = import.meta.env.VITE_APP_ROUTER_MODE;

/**
 * Hook that returns application routes based on permission mode.
 */
export function usePermissionRoutes(): AppRouteObject[] {
  if (ROUTE_MODE === "module") {
    return getRoutesFromModules();
  }

  const permissions = useUserPermission();

  return useMemo(() => {
    if (!permissions?.length) return [];

    const flattenedPermissions = flattenTrees(permissions);
    return transformPermissionsToRoutes(
      permissions,
      flattenedPermissions
    );
  }, [permissions]);
}