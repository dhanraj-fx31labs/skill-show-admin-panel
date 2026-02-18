import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MenuTree, Permission, Role, UserInfo, UserToken } from "#/entity";
import { BasicStatus, type PermissionType, StorageEnum } from "#/enum";
import authService, {
	type AuthLoginReq,
	type AuthUserProfile,
	type AuthPermissionNode,
} from "@/api/services/authService";

function mapNodeToPermission(n: AuthPermissionNode): Permission {
	return {
		id: n.id,
		parentId: n.parentId ?? undefined,
		name: n.name,
		label: n.label,
		route: n.route,
		type: n.type as PermissionType,
		order: n.order ?? undefined,
		icon: n.icon ?? undefined,
		component: n.component ?? undefined,
		hide: n.hide ?? undefined,
		code: n.name,
		read: n.read,
		create: n.create,
		can_update: n.update ?? n.can_update,
		delete: n.delete,
		is_user_specific: n.isUserSpecific,
		children: n.children?.map(mapNodeToPermission),
	};
}

function mapNodeToMenuTree(n: AuthPermissionNode): MenuTree {
	return {
		id: n.id,
		parentId: n.parentId ?? "",
		name: n.name,
		code: n.name,
		path: n.route,
		type: n.type as PermissionType,
		order: n.order ?? undefined,
		icon: n.icon ?? undefined,
		component: n.component ?? undefined,
		hidden: n.hide ?? undefined,
		children: n.children?.map(mapNodeToMenuTree),
	};
}

function mapAuthProfileToUserInfo(profile: AuthUserProfile): UserInfo {
	const roles: Role[] = (profile.roles || []).map((r) => ({
		id: r.id,
		name: r.name,
		code: r.name,
	}));

	const sourceTree = profile.permissionTree ?? profile.permissions ?? profile.menu ?? [];
	const permissions: Permission[] = sourceTree.map(mapNodeToPermission);
	const menu: MenuTree[] = sourceTree.map(mapNodeToMenuTree);

	const username =
		profile.displayName ||
		(profile.firstName || profile.lastName
			? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
			: undefined) ||
		profile.email;
	return {
		id: profile.id,
		email: profile.email,
		username,
		roles,
		status: profile.isActive ? BasicStatus.ENABLE : BasicStatus.DISABLE,
		permissions,
		menu,
	};
}

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;

	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		clearUserInfoAndToken: () => void;
	};
};

const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			userInfo: {},
			userToken: {},
			actions: {
				setUserInfo: (userInfo) => {
					set({ userInfo });
				},
				setUserToken: (userToken) => {
					set({ userToken });
				},
				clearUserInfoAndToken() {
					set({ userInfo: {}, userToken: {} });
				},
			},
		}),
		{
			name: "userStore", // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.userInfo,
				[StorageEnum.UserToken]: state.userToken,
			}),
		},
	),
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
/** User permissions (tree); undefined when not loaded. Used by router in backend mode. */
export const useUserPermission = () => useUserStore((state) => state.userInfo.permissions);
export const useUserPermissions = () => useUserStore((state) => state.userInfo.permissions || []);
export const useUserRoles = () => useUserStore((state) => state.userInfo.roles || []);
export const useUserActions = () => useUserStore((state) => state.actions);

export const useSignIn = () => {
	const { setUserToken, setUserInfo } = useUserActions();

	const signInMutation = useMutation({
		mutationFn: authService.login,
	});

	const signIn = async (data: AuthLoginReq) => {
		try {
			const res = await signInMutation.mutateAsync(data);
			const { user, accessToken, refreshToken } = res;
			setUserToken({ accessToken, refreshToken });
			setUserInfo(mapAuthProfileToUserInfo(user));
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Login failed";
			toast.error(message, {
				position: "top-center",
			});
			throw err;
		}
	};

	return signIn;
};

export default useUserStore;
