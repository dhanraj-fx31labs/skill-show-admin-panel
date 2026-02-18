import { USER_LIST } from "@/_mock/assets";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { KeepAliveTab } from "../types";

export function useTabLabelRender() {
	const { t } = useTranslation();

	const specialTabRenderMap = useMemo<Record<string, (tab: KeepAliveTab) => React.ReactNode>>(
		() => ({
			"sys.nav.system.user_detail": (tab: KeepAliveTab) => {
				const userId = tab.params?.id;
				const defaultLabel = t(tab.label) !== tab.label ? t(tab.label) : (tab.label ?? "User Detail");
				if (userId) {
					const user = USER_LIST?.find((item) => item.id === userId);
					return user ? `${user.username}-${defaultLabel}` : `${userId}-${defaultLabel}`;
				}
				return defaultLabel;
			},
		}),
		[t],
	);

	const renderTabLabel = (tab: KeepAliveTab) => {
		const specialRender = specialTabRenderMap[tab.label];
		if (specialRender) {
			return specialRender(tab);
		}
		const translated = t(tab.label);
		return translated !== tab.label ? translated : (tab.label ?? "Home");
	};

	return renderTabLabel;
}
