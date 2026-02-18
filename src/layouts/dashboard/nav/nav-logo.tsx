import { Icon } from "@/components/icon";
import Logo from "@/components/logo";
import { cn } from "@/utils";

const SIDEBAR_LOGO_HEIGHT = 52;
const LOGO_SIZE_EXPANDED = 36;
const LOGO_SIZE_COLLAPSED = 28;

type Props = {
	collapsed?: boolean;
	onToggle?: () => void;
	/** Drawer/mobile: no collapse button, compact */
	variant?: "sidebar" | "drawer";
	/** Optional right slot (e.g. close button) in drawer variant */
	rightSlot?: React.ReactNode;
};

export default function NavLogo({ collapsed = false, onToggle, variant = "sidebar", rightSlot }: Props) {
	const isDrawer = variant === "drawer";

	return (
		<div
			style={{ height: isDrawer ? 56 : SIDEBAR_LOGO_HEIGHT }}
			className={cn(
				"relative flex shrink-0 items-center border-b border-dashed",
				isDrawer ? "justify-between px-4 bg-muted/30" : "justify-center",
				!isDrawer && (collapsed ? "justify-center px-0" : "justify-center px-3"),
			)}
		>
			<Logo size={isDrawer ? 32 : collapsed ? LOGO_SIZE_COLLAPSED : LOGO_SIZE_EXPANDED} className="shrink-0" />
			{isDrawer && rightSlot}
			{!isDrawer && onToggle && (
				<button
					type="button"
					onClick={onToggle}
					className="absolute right-0 top-1/2 z-50 hidden size-5 -translate-y-1/2 translate-x-1/2 cursor-pointer select-none items-center justify-center rounded-full border border-dashed bg-bg-paper text-center text-sm transition-all md:flex"
				>
					{collapsed ? (
						<Icon icon="ant-design:right-outlined" size={10} className="text-text-disabled" />
					) : (
						<Icon icon="ant-design:left-outlined" size={10} className="text-text-disabled" />
					)}
				</button>
			)}
		</div>
	);
}
