import { AuthGuard } from "@/components/auth/auth-guard";
import { LineLoading } from "@/components/loading";
import { GLOBAL_CONFIG } from "@/global-config";
import Page403 from "@/pages/sys/error/Page403";
import { useSettings } from "@/store/settingStore";
import { cn } from "@/utils";
import { flattenTrees } from "@/utils/tree";
import { clone, concat } from "ramda";
import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { backendNavData } from "./nav/nav-data/nav-data-backend";
import { frontendNavData } from "./nav/nav-data/nav-data-frontend";
import { MULTI_TABS_HEIGHT } from "./config";
import { themeVars } from "@/theme/theme.css";
import { CSSProperties } from "styled-components";
import { MultiTabsProvider } from "./multi-tabs/providers/multi-tabs-provider";
import MultiTabs from "./multi-tabs";

/**
 * find auth by path
 * @param path
 * @returns
 */
function findAuthByPath(path: string): string[] {
	const foundItem = allItems.find((item) => item.path === path);
	return foundItem?.auth || [];
}

const navData = GLOBAL_CONFIG.routerMode === "module" ? clone(frontendNavData) : backendNavData;
const allItems = navData.reduce((acc: any[], group) => {
	const flattenedItems = flattenTrees(group.items);
	return concat(acc, flattenedItems);
}, []);

const Main = () => {
	const { themeStretch ,multiTab} = useSettings();
  const mainStyle: CSSProperties = {
		paddingTop: multiTab ? MULTI_TABS_HEIGHT : 0,
		background: themeVars.colors.background.default,
		transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
		width: "100%",
	};
	const { pathname } = useLocation();
	const currentNavAuth = findAuthByPath(pathname);

	return (
		<AuthGuard checkAny={currentNavAuth} fallback={<Page403 />}>
			<main
				data-slot="slash-layout-main"
				className={cn(
					"flex-auto w-full flex flex-col",
					"transition-[max-width] duration-300 ease-in-out",
					"px-4 sm:px-6 py-4 sm:py-6 md:px-8 mx-auto",
					{
						"max-w-full": themeStretch,
						"xl:max-w-screen-xl": !themeStretch,
					},
				)}
				style={{
					willChange: "max-width",
				}}
			>
				<Suspense fallback={<LineLoading />}>
					{multiTab ? (
						<MultiTabsProvider>
							<MultiTabs />
						</MultiTabsProvider>
					) : (
						<Outlet />
					)}
					<ScrollRestoration />
				</Suspense>
			</main>
		</AuthGuard>
	);
};

export default Main;
