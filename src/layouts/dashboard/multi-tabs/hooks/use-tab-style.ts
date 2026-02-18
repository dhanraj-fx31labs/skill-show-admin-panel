import { down, useMediaQuery } from "@/hooks";
import { useSettings } from "@/store/settingStore";
import { themeVars } from "@/theme/theme.css";
import { rgbAlpha } from "@/utils/theme";
import { type CSSProperties, useMemo } from "react";
import { ThemeLayout } from "#/enum";
import { HEADER_HEIGHT, MULTI_TABS_HEIGHT, NAV_COLLAPSED_WIDTH, NAV_HORIZONTAL_HEIGHT, NAV_WIDTH } from "../../config";

export function useMultiTabsStyle() {
	const { themeLayout } = useSettings();
	const isMobile = useMediaQuery(down("md"));

	return useMemo(() => {
		const style: CSSProperties = {
			position: "fixed",
			top: HEADER_HEIGHT,
			left: 0,
			right: 0,
			height: MULTI_TABS_HEIGHT,
			backgroundColor: rgbAlpha(themeVars.colors.background.defaultChannel, 0.9),
			backdropFilter: "blur(8px)",
			transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
			zIndex: 10,
		};

		if (isMobile) {
			style.width = "100%";
			style.left = 0;
		} else if (themeLayout === ThemeLayout.Horizontal) {
			style.top = HEADER_HEIGHT + NAV_HORIZONTAL_HEIGHT;
			style.width = "100%";
		} else {
			style.left = themeLayout === ThemeLayout.Mini ? NAV_COLLAPSED_WIDTH : NAV_WIDTH;
			style.width = `calc(100% - ${themeLayout === ThemeLayout.Mini ? NAV_COLLAPSED_WIDTH : NAV_WIDTH}px)`;
		}

		return style;
	}, [themeLayout, isMobile]);
}
