import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "sonner";
import { ResultStatus } from "#/enum";
import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";

const HTTP_OK = 200;
const HTTP_CREATED = 201;

/** Backend may return status 200/201; frontend mock uses ResultStatus (0) */
type ApiResponseBody = {
	status: number;
	message?: string;
	data?: unknown;
};

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.backendUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

axiosInstance.interceptors.request.use(
	(config) => {
		const accessToken = userStore.getState().userToken?.accessToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(res: AxiosResponse<ApiResponseBody>) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
		const body = res.data;
		const status = body.status;
		const isSuccess = status === ResultStatus.SUCCESS || status === HTTP_OK || status === HTTP_CREATED;
		if (isSuccess) {
			return { ...res, data: body.data };
		}
		throw new Error(body.message || t("sys.api.apiRequestFailed"));
	},
	(error: AxiosError<{ message?: string }>) => {
		const { response, message } = error || {};
		const errMsg = response?.data?.message || message || t("sys.api.errorMessage");
		toast.error(errMsg, { position: "top-center" });
		if (response?.status === 401) {
			userStore.getState().actions.clearUserInfoAndToken();
		}
		return Promise.reject(error);
	},
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		const res = await axiosInstance.request(config);
		return (res as AxiosResponse<{ data: T }>).data as T;
	}
}

export default new APIClient();
