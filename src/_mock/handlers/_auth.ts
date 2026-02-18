import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";

import { AuthApi } from "@/api/services/authService";

const MOCK_EMAIL = "admin@demo.com";
const MOCK_PASSWORD = "demo1234";

const mockUserProfile = {
	id: "b34719e1-ce46-457e-9575-99505ecee828",
	email: MOCK_EMAIL,
	firstName: "Admin",
	lastName: "User",
	displayName: "Admin",
	isActive: true,
	isEmailVerified: true,
	roles: [{ id: "role-1", name: "admin", description: "Administrator" }],
	permissionTree: [],
};

const loginHandler = http.post(`/api${AuthApi.Login}`, async ({ request }) => {
	await delay(300);
	const body = (await request.json()) as { email: string; password: string };
	const { email, password } = body;

	if (email !== MOCK_EMAIL || password !== MOCK_PASSWORD) {
		return HttpResponse.json({ status: 401, message: "Invalid email or password." }, { status: 401 });
	}

	return HttpResponse.json({
		status: 200,
		message: "OK",
		data: {
			user: mockUserProfile,
			accessToken: faker.string.alphanumeric(32),
			refreshToken: faker.string.alphanumeric(32),
			expiresIn: 900,
		},
	});
});

const registerHandler = http.post(`/api${AuthApi.Register}`, async ({ request }) => {
	await delay(300);
	await request.json();
	return HttpResponse.json({
		status: 201,
		message: "Created",
		data: {
			message: "Registration successful. Please verify your email.",
			email: "",
			requiresVerification: true,
		},
	});
});

const refreshTokenHandler = http.post(`/api${AuthApi.RefreshToken}`, async ({ request }) => {
	await delay(100);
	const body = (await request.json()) as { refreshToken: string };
	if (!body.refreshToken) {
		return HttpResponse.json({ status: 401, message: "Refresh token required." }, { status: 401 });
	}
	return HttpResponse.json({
		status: 200,
		message: "OK",
		data: {
			accessToken: faker.string.alphanumeric(32),
			refreshToken: faker.string.alphanumeric(32),
		},
	});
});

export default [loginHandler, registerHandler, refreshTokenHandler];
