import type { Role } from "#/entity";
import { UserApi } from "@/api/services/userService";
import { ResultStatus } from "@/types/enum";
import { convertFlatToTree } from "@/utils/tree";
import { faker } from "@faker-js/faker";
import { http, HttpResponse, type HttpHandler } from "msw";
import { PERMISSION_LIST, ROLE_LIST, USER_LIST } from "../assets";
import { DB_MENU } from "../assets_backup";

/** Admin: full PERMISSION_LIST from assets. Test: TEST_ROLE.permission from assets (dashboard, components, functions). */
function getPermissionsForUser(user: (typeof USER_LIST)[number]) {
	const isTest = String(user.username).toLowerCase() === "test";
	if (isTest) {
		const testRole = ROLE_LIST.find((r) => String(r.label).toLowerCase() === "test");
		const list = testRole?.permission ?? [];
		return list.slice();
	}
	return PERMISSION_LIST.slice();
}

const signIn: HttpHandler = http.post(`/api${UserApi.SignIn}`, async ({ request }) => {
	const body = (await request.json()) as Record<string, string>;
	const username = body.username?.trim();
	const password = body.password;

	const user = USER_LIST.find((item) => String(item.username).toLowerCase() === String(username).toLowerCase());

	if (!user || user.password !== password) {
		return HttpResponse.json(
			{
				status: 10001,
				message: "Incorrect username or password.",
				data: null,
			},
			{ status: 200 },
		);
	}

	const role = user.role;
	const permissions = getPermissionsForUser(user);
	const roles: Role[] = role ? [{ id: role.id, name: role.name, code: role.label }] : [];
	const menu = convertFlatToTree(DB_MENU);

	const responseUser = {
		id: user.id,
		username: user.username,
		email: user.email,
		avatar: user.avatar,
		roles,
		permissions,
		menu,
	};

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "",
			data: {
				user: responseUser,
				accessToken: faker.string.uuid(),
				refreshToken: faker.string.uuid(),
			},
		},
		{ status: 200 },
	);
});

const userList: HttpHandler = http.get("/api/user", async () => {
	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "",
			data: Array.from({ length: 10 }, () => ({
				fullname: faker.person.fullName(),
				email: faker.internet.email(),
				avatar: faker.image.avatarGitHub(),
				address: faker.location.streetAddress(),
			})),
		},
		{ status: 200 },
	);
});

export { signIn, userList };
