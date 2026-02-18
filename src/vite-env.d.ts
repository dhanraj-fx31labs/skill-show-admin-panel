/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_ROUTER_MODE?: "permission" | "module";
	readonly VITE_APP_BASE_API?: string;
	readonly VITE_APP_API_BASE_URL?: string;
	readonly VITE_APP_HOMEPAGE?: string;
	readonly VITE_APP_BASE_PATH?: string;
	readonly VITE_APP_PUBLIC_PATH?: string;
	readonly VITE_APP_DEFAULT_ROUTE?: string;
	readonly VITE_APP_ENV?: "development" | "production";
	readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
