import { useCurrentRouteMeta } from "@/router/hooks";
import { useLocation } from "react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTabOperations } from "../hooks/use-tab-operations";
import type { KeepAliveTab, MultiTabsContextType } from "../types";

const MultiTabsContext = createContext<MultiTabsContextType>({
	tabs: [],
	activeTabRoutePath: "",
	setTabs: () => {},
	closeTab: () => {},
	closeOthersTab: () => {},
	closeAll: () => {},
	closeLeft: () => {},
	closeRight: () => {},
	refreshTab: () => {},
});

export function MultiTabsProvider({ children }: { children: React.ReactNode }) {
	const [tabs, setTabs] = useState<KeepAliveTab[]>([]);
	const currentRouteMeta = useCurrentRouteMeta();
	const { pathname } = useLocation();

	const activeTabRoutePath = pathname;

	const operations = useTabOperations(tabs, setTabs, activeTabRoutePath);

	useEffect(() => {
		if (!currentRouteMeta || currentRouteMeta.hideTab) return;

		const key = currentRouteMeta.key;
		const outlet = currentRouteMeta.outlet;

		setTabs((prev) => {
			const filtered = prev.filter((item) => !item.hideTab);
			if (filtered.some((item) => item.key === key)) return prev;

			return [
				...filtered,
				{
					...currentRouteMeta,
					key,
					children: outlet,
					timeStamp: Date.now().toString(),
				},
			];
		});
	}, [currentRouteMeta]);

	const contextValue = useMemo(
		() => ({
			tabs,
			activeTabRoutePath,
			setTabs,
			...operations,
		}),
		[tabs, activeTabRoutePath, operations],
	);

	return <MultiTabsContext.Provider value={contextValue}>{children}</MultiTabsContext.Provider>;
}

export function useMultiTabsContext() {
	return useContext(MultiTabsContext);
}
