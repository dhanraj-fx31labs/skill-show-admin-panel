import packageJson from "../package.json";

/**
 * Global application configuration type definition
 */
export type GlobalConfig = {
	/** Application name */
	appName: string;
	/** Application version number */
	appVersion: string;
	/** Default route path for the application */
	defaultRoute: string;
	/** Public path for static assets */
	publicPath: string;
	/** Base URL for API endpoints */
	apiBaseUrl: string;
	/** Routing mode: module (static routes from files) or permission (routes from user permission tree) */
	routerMode: "module" | "permission";
	backendUrl: string;
};

/**
 * Global configuration constants
 * Reads configuration from environment variables and package.json
 *
 * @warning
 * Please don't use the import.meta.env to get the configuration, use the GLOBAL_CONFIG instead
 */
export const GLOBAL_CONFIG: GlobalConfig = {
	appName: "Skill Show",
	appVersion: packageJson.version,
	defaultRoute: import.meta.env.VITE_APP_DEFAULT_ROUTE || "/dashboard/workbench",
	publicPath: import.meta.env.VITE_APP_PUBLIC_PATH || "/",
	apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL || "/api",
	routerMode: import.meta.env.VITE_APP_ROUTER_MODE || "module",
	backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
};
