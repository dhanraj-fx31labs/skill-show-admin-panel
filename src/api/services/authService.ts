import apiClient from "../apiClient";

/**
 * Auth API service – integrates with skillshow backend auth only.
 * POST /api/auth/login, /api/auth/register, /api/auth/refresh-token
 */

export interface AuthLoginReq {
	email: string;
	password: string;
}

export interface AuthRegisterReq {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}

export interface AuthRefreshReq {
	refreshToken: string;
}

/** Backend permission tree node (RBAC) */
export interface AuthPermissionNode {
	id: string;
	name: string;
	label: string;
	route: string;
	type: number;
	icon?: string | null;
	parentId?: string | null;
	order?: number | null;
	component?: string | null;
	hide?: boolean | null;
	create?: boolean;
	read?: boolean;
	update?: boolean;
	/** Some backends send can_update instead of update */
	can_update?: boolean;
	delete?: boolean;
	isUserSpecific?: boolean;
	children?: AuthPermissionNode[];
}

/** Backend role info */
export interface AuthRoleInfo {
	id: string;
	name: string;
	description?: string;
}

/** Backend user profile in login response. May include permissionTree or permissions+menu. */
export interface AuthUserProfile {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	isActive: boolean;
	isEmailVerified: boolean;
	roles: AuthRoleInfo[];
	permissionTree?: AuthPermissionNode[];
	/** When backend returns permissions/menu directly instead of permissionTree */
	permissions?: AuthPermissionNode[];
	menu?: AuthPermissionNode[];
}

export interface AuthLoginRes {
	user: AuthUserProfile;
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface AuthRefreshRes {
	accessToken: string;
	refreshToken: string;
}

export interface AuthRegisterRes {
	message: string;
	email: string;
	requiresVerification: boolean;
}

export enum AuthApi {
	Login = "/auth/login",
	Register = "/auth/register",
	RefreshToken = "/auth/refresh-token",
}

const login = (data: AuthLoginReq) => apiClient.post<AuthLoginRes>({ url: AuthApi.Login, data });

const register = (data: AuthRegisterReq) => apiClient.post<AuthRegisterRes>({ url: AuthApi.Register, data });

const refreshToken = (data: AuthRefreshReq) => apiClient.post<AuthRefreshRes>({ url: AuthApi.RefreshToken, data });

export default {
	login,
	register,
	refreshToken,
};
