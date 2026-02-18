import { Icon } from "@/components/icon";
import Logo from "@/components/logo";
import LocalePicker from "@/components/locale-picker";
import { useSettings } from "@/store/settingStore";
import { Button } from "@/ui/button";
import { cn } from "@/utils";
import { down, useMediaQuery } from "@/hooks";
import { useState } from "react";
import type { ReactNode } from "react";
import { ThemeLayout } from "#/enum";
import AccountDropdown from "../components/account-dropdown";
import BreadCrumb from "../components/bread-crumb";
import NoticeButton from "../components/notice";
import SearchBar from "../components/search-bar";
import SettingButton from "../components/setting-button";
import { NavMobileDrawer } from "./nav/nav-mobile-drawer";

interface HeaderProps {
	leftSlot?: ReactNode;
}

export default function Header({ leftSlot }: HeaderProps) {
	const { breadCrumb, themeLayout } = useSettings();
	const isMobile = useMediaQuery(down("md"));
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const showMobileMenu = isMobile && themeLayout !== ThemeLayout.Horizontal;

	return (
		<>
			<header
				data-slot="slash-layout-header"
				className={cn(
					"sticky top-0 left-0 right-0 z-app-bar",
					"flex items-center justify-between gap-2 grow-0 shrink-0",
					"bg-background/95 backdrop-blur-xl border-b border-border/50",
					"min-h-[var(--layout-header-height)] h-[var(--layout-header-height)] px-3 sm:px-4",
				)}
			>
				<div className="flex items-center gap-2 min-w-0 flex-1">
					{showMobileMenu && (
						<Button
							variant="outline"
							size="icon"
							className="shrink-0 size-10 rounded-lg md:hidden border-border/80 shadow-sm"
							onClick={() => setMobileDrawerOpen(true)}
							aria-label="Open menu"
						>
							<Icon icon="solar:hamburger-menu-bold" size={22} className="text-foreground" />
						</Button>
					)}
					{isMobile ? (
						<div className="flex items-center min-w-0 flex-1 justify-center">
							<Logo size={32} className="shrink-0" />
						</div>
					) : (
						<>
							{leftSlot}
							<div className="hidden md:block ml-2">{breadCrumb && <BreadCrumb />}</div>
						</>
					)}
				</div>

				<div className="flex items-center gap-1">
					<SearchBar />
					<LocalePicker />
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full"
						onClick={() => window.open("https://github.com/d3george/slash-admin")}
					>
						<Icon icon="mdi:github" size={24} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full"
						onClick={() => window.open("https://discord.gg/fXemAXVNDa")}
					>
						<Icon icon="carbon:logo-discord" size={24} />
					</Button>
					<NoticeButton />
					<SettingButton />
					<AccountDropdown />
				</div>
			</header>
			{showMobileMenu && <NavMobileDrawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen} />}
		</>
	);
}
