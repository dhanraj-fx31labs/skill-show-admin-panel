import { Icon } from "@/components/icon";
import Logo from "@/components/logo";
import { HEADER_HEIGHT } from "../config";

type Props = {
	collapsed: boolean;
	onToggle: () => void;
};
export default function NavLogo({ collapsed, onToggle }: Props) {
	return (
		<div style={{ height: `${HEADER_HEIGHT}px` }} className="relative flex items-center justify-center py-4">
			<div className="flex items-center">
				<Logo size={"150px"} />
			</div>
			<button
				type="button"
				onClick={onToggle}
				className="absolute right-0 transition-all top-1/2 z-50 hidden size-6 translate-x-1/2 -translate-y-1/2 cursor-pointer select-none items-center justify-center rounded-full text-center md:flex border border-dashed text-sm bg-bg-paper"
			>
				{collapsed ? (
					<Icon icon="ant-design:right-outlined" size={12} className="text-text-disabled" />
				) : (
					<Icon icon="ant-design:left-outlined" size={12} className="text-text-disabled" />
				)}
			</button>
		</div>
	);
}
