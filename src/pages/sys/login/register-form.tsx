import authService, { type AuthRegisterReq } from "@/api/services/authService";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

type RegisterFormValues = AuthRegisterReq & { confirmPassword: string };

function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();

	const signUpMutation = useMutation({
		mutationFn: authService.register,
	});

	const form = useForm<RegisterFormValues>({
		defaultValues: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
			confirmPassword: "",
		},
	});

	const onFinish = async (values: RegisterFormValues) => {
		try {
			await signUpMutation.mutateAsync({
				email: values.email,
				password: values.password,
				firstName: values.firstName || undefined,
				lastName: values.lastName || undefined,
			});
			toast.success(t("sys.login.registerSuccess") || "Registration successful. Please check your email.");
			backToLogin();
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Registration failed";
			toast.error(message);
		}
	};

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">{t("sys.login.signUpFormTitle")}</h1>
				</div>

				<FormField
					control={form.control}
					name="email"
					rules={{ required: t("sys.login.emaildPlaceholder") }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="email" placeholder={t("sys.login.email")} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder={t("sys.login.firstName") || "First name"} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder={t("sys.login.lastName") || "Last name"} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					rules={{ required: t("sys.login.passwordPlaceholder") }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={t("sys.login.password")} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					rules={{
						required: t("sys.login.confirmPasswordPlaceholder"),
						validate: (value) => value === form.getValues("password") || t("sys.login.diffPwd"),
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder={t("sys.login.confirmPassword")} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full">
					{t("sys.login.registerButton")}
				</Button>

				<div className="mb-2 text-xs text-gray">
					<span>{t("sys.login.registerAndAgree")}</span>
					<a href="./" className="text-sm underline! text-primary!">
						{t("sys.login.termsOfService")}
					</a>
					{" & "}
					<a href="./" className="text-sm underline! text-primary!">
						{t("sys.login.privacyPolicy")}
					</a>
				</div>

				<ReturnButton onClick={backToLogin} />
			</form>
		</Form>
	);
}

export default RegisterForm;
