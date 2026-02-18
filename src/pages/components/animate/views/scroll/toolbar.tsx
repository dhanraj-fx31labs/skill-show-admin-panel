import { Icon } from "@/components/icon";

type Props = {
	onRefresh: VoidFunction;
};
export default function Toolbar({ onRefresh }: Props) {
	return (
		<button
			type="button"
			className="mb-4 flex items-center justify-end cursor-pointer border-0 bg-transparent p-0"
			onClick={onRefresh}
		>
			<Icon icon="material-symbols:refresh" size={24} />
		</button>
	);
}
