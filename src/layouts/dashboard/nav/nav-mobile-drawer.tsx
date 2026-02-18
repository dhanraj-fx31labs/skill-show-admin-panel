import { Sheet, SheetContent } from "@/ui/sheet";
import NavVertical from "./nav-vertical";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function NavMobileDrawer({ open, onOpenChange }: Props) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="left"
				hideClose
				className="w-[280px] max-w-[85vw] p-0 gap-0 flex flex-col overflow-hidden border-r shadow-xl"
			>
				<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
					<NavVertical closeSideBarDrawer={() => onOpenChange(false)} isDrawer />
				</div>
			</SheetContent>
		</Sheet>
	);
}
