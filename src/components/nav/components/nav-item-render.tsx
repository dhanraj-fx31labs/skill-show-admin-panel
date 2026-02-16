import { useRef } from "react";
import { RouterLink } from "@/router/components/router-link";
import type { NavItemProps } from "../types";

type NavItemRendererProps = {
	item: NavItemProps;
	className: string;
	children: React.ReactNode;
};

/**
 * Renderer for Navigation Items.
 * Handles disabled, external link, clickable child container, and internal link logic.
 */
export const NavItemRenderer: React.FC<NavItemRendererProps> = ({ item, className, children }) => {
	const { disabled, hasChild, path, onClick } = item;
	const buttonRef = useRef<HTMLButtonElement>(null);

	if (disabled) {
		return <div className={className}>{children}</div>;
	}

	if (hasChild) {
		return (
			<button
				ref={buttonRef}
				type="button"
				className={className}
				onClick={onClick as unknown as React.MouseEventHandler<HTMLButtonElement>}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						buttonRef.current?.click();
					}
				}}
			>
				{children}
			</button>
		);
	}

	// Default: internal link
	return (
		<RouterLink href={path} className={className}>
			{children}
		</RouterLink>
	);
};
