import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import ForgotPasswordModal from "@/components/features/auth/modals/ForgotPasswordModal";
import OtpLoginModal from "@/components/features/auth/modals/OtpLoginModal";
import OtpVerifyModal from "@/components/features/auth/modals/OtpVerifyModal";
import { useAuthFlow } from "@/components/features/auth/hooks/useAuthFlow";
import { EMAIL_RULES } from "@/components/features/auth/validation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";
import FigIcon from "@/components/ui/FigIcon";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { showError } from "@/components/ui/toast";
import type { LoginFormValues } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

import LoginHeader from "./LoginHeader";

const carouselData = [
	{
		title: "Link your Box",
		description:
			"Scan the box and connect via Bluetooth — it's fast and easy.",
	},
	{
		title: "Track Orders",
		description: "Monitor your orders in real-time with ease.",
	},
	{
		title: "Manage Inventory",
		description: "Keep your stock updated and never run out.",
	},
];

export default function LoginScreen() {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [carouselIndex, setCarouselIndex] = useState<number>(0);
	const [rememberMe, setRememberMe] = useState<boolean>(false);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const {
		formRef,
		otpRefs,
		otp,
		setOtp,
		timer,
		loginLoading,
		otpError,
		otpModalOpen,
		setOtpModalOpen,
		otpVerifyModalOpen,
		setOtpVerifyModalOpen,
		forgotPasswordModalOpen,
		setForgotPasswordModalOpen,
		handleLogin,
		handleOtpLogin,
		handleForgotPassword,
		handleResendOtp,
		handleOtpVerify,
		setOtpError,
		otpEmail,
		forgotPasswordLoading,
		otpLoading,
	} = useAuthFlow({
		setAlertMessage,
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<LoginFormValues>({
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const emailField = register("email", EMAIL_RULES);

	const passwordField = register("password", {
		required: "Password is required",
	});

	const { onBlur: emailOnBlur, ...emailFieldProps } = emailField;
	const { onBlur: passwordOnBlur, onChange: passwordOnChange, ...passwordFieldProps } = passwordField;

	useEffect(() => {
		const interval = setInterval(() => {
			setCarouselIndex(
				(prevIndex) => (prevIndex + 1) % carouselData.length,
			);
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const onLoginError = () => {
		if (errors.password) {
			showError("Password is required");
		} else if (errors.email) {
			showError(errors.email.message ?? "Email is required");
		}
	};

	const handleDismissAlert = useCallback(() => setAlertMessage(null), []);

	return (
		<>
			{alertMessage && (
				<div className="fixed top-[10px] left-0 right-0 z-[9999] flex justify-center w-full pointer-events-none">
					<Alert
						variant="error"
						onClick={() => setAlertMessage(null)}
						autoDismiss
						onDismiss={handleDismissAlert}
						dismissTime={3000}
						className="rounded cursor-pointer shadow-md w-[95vw] pointer-events-auto"
					>
						<AlertDescription>
							{alertMessage}
						</AlertDescription>
					</Alert>
				</div>
			)}
			<div className="w-full h-full bg-white container mx-auto">
				<LoginHeader />
			</div>
			<div className="p-6 w-full flex items-center justify-center min-h-[calc(100vh-116px)]">
				<div className="mx-auto flex flex-col md:flex-row items-center justify-center gap-12">
					<div className="w-[50%] h-[640px] p-12 flex flex-col gap-6 bg-white">
						<div>
							<h2 className="font-family-heading text-[var(--gp-color-text-neutral-primary)] font-[var(--gp-font-weight-heading)] mb-2">
								Welcome to GrubPac!
							</h2>
							<p className="font-family-text text-[var(--gp-color-text-neutral-secondary)]">
								Enter your registered details to access your
								account.
							</p>
						</div>
						<form
							ref={formRef}
							className="flex flex-col gap-4"
							onSubmit={handleSubmit(
								(data: LoginFormValues) => handleLogin(data),
								onLoginError,
							)}
						>
							<TextField
								size="xl"
								type="email"
								placeholder="Email ID"
								state="press"
								hasHoverEffect={true}
								leadingIcon={<FigIcon name="user" size={24} />}
								error={errors.email?.message}
								onBlur={emailOnBlur}
								{...emailFieldProps}
							/>
							<TextField
								size="xl"
								type={showPassword ? "text" : "password"}
								placeholder="Password"
								state="press"
								hasHoverEffect={true}
								leadingIcon={<FigIcon name="key" size={24} />}
								trailingIcon={
									showPassword ? (
										<FigIcon name="eye" size={24} />
									) : (
										<FigIcon name="eye-slash" size={24} />
									)
								}
								onTrailingIconClick={() =>
									setShowPassword(!showPassword)
								}
								error={errors.password?.message}
								onBlur={passwordOnBlur}
								onChange={(e) => {
									if (e.target.value.includes(" ")) {
										e.target.value = e.target.value.replace(/\s/g, "");
										setAlertMessage("Spaces are not allowed in the password");
									}
									passwordOnChange(e);
								}}
								{...passwordFieldProps}
							/>

							<div className="flex items-center justify-between h-[28px]">
								<div className="flex items-center gap-[var(--gp-space-m)]">
									<TableCheckbox
										checked={rememberMe}
										onChange={(event) =>
											setRememberMe(event.target.checked)
										}
									/>
									<span className="font-family-text font-[var(--gp-font-weight-text)] text-[length:var(--gp-text-size-lg)] leading-[var(--gp-text-line-height-lg)] text-[var(--gp-color-text-neutral-secondary)] cursor-pointer select-none">
										Remember me
									</span>
								</div>
								<Button
									variant="neutral"
									appearance="ghost"
									onClick={() =>
										setForgotPasswordModalOpen(true)
									}
									type="button"
									className="uppercase text-[length:var(--gp-button-font-size-lg)]"
								>
									<span>Forgot password</span>
								</Button>
							</div>

							<Button
								type="submit"
								disabled={!isValid || loginLoading}
								variant="primary"
								appearance="solid"
								size="xl"
								state="press"
								className="w-full font-family-interactive font-[var(--gp-font-weight-interactive)] text-[20px] leading-[var(--gp-button-line-height-lg)]  !my-0 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span>
									{loginLoading
										? "LOGGING IN..."
										: "CONTINUE"}
								</span>
							</Button>
							<div className="flex justify-center gap-1">
								<span className="font-family-text text-[var(--gp-color-text-neutral-secondary)]">
									or
								</span>
							</div>
							<Button
								type="button"
								variant="neutral"
								appearance="outlined"
								size="xl"
								state="press"
								className="w-full font-family-interactive font-[var(--gp-font-weight-interactive)] text-[20px] leading-[var(--gp-button-line-height-lg)]  !my-0 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => setOtpModalOpen(true)}
							>
								<span>LOGIN USING OTP</span>
							</Button>
						</form>
						<div className="flex justify-evenly mt-14">
							<Button
								variant="neutral"
								appearance="ghost"
								size="default"
								asChild
							>
								<a href="#">
									<span>PRIVACY POLICY</span>
								</a>
							</Button>
							<Button
								variant="neutral"
								appearance="ghost"
								size="default"
								asChild
							>
								<a href="#">
									<span>TERMS OF SERVICE</span>
								</a>
							</Button>
						</div>
					</div>

					<div className="hidden md:flex flex-col items-center justify-center w-[820px] px-12 py-12 h-[640px] ml-6 bg-[var(--gp-color-bg-neutral-secondary)] rounded-lg">
						<div className="w-full h-full bg-white mb-6 flex items-center justify-center">
								<img src="/box.png" alt="Box" className="w-full h-[390px] object-contain p-8" />
							</div>
						<div className="text-center">
							<div className="font-[var(--gp-font-weight-heading)] text-[var(--gp-color-text-neutral-primary)] mb-1 text-heading-large font-family-heading">
								{carouselData[carouselIndex].title}
							</div>
							<div className="text-[var(--gp-color-text-neutral-secondary)] mb-4 max-w-md font-family-text">
								{carouselData[carouselIndex].description}
							</div>
							<div className="flex justify-center gap-4 mt-2">
								{carouselData.map((_, idx) => (
									<button
										key={idx}
										onClick={() => setCarouselIndex(idx)}
										className={`w-3 h-3 rounded-full focus:outline-none transition-all duration-200 ${idx === carouselIndex
												? "bg-[var(--gp-color-brand-primary)]"
												: "bg-white"
											}`}
										aria-label={`Go to slide ${idx + 1}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				<OtpLoginModal
					open={otpModalOpen}
					onCloseAction={() => setOtpModalOpen(false)}
					onNextAction={handleOtpLogin}
					otpLoading={otpLoading}
				/>
				<OtpVerifyModal
					open={otpVerifyModalOpen}
					onClose={() => setOtpVerifyModalOpen(false)}
					email={otpEmail}
					otp={otp}
					setOtp={setOtp}
					timer={timer}
					onBack={() => {
						setOtpVerifyModalOpen(false);
						setOtpModalOpen(true);
						setOtpError(false);
					}}
					onVerify={handleOtpVerify}
					otpRefs={otpRefs}
					otpError={otpError}
					onResend={handleResendOtp}
					showBackButton
				/>
				<ForgotPasswordModal
					open={forgotPasswordModalOpen}
					onCloseAction={() => setForgotPasswordModalOpen(false)}
					onNextAction={handleForgotPassword}
					forgotPasswordLoading={forgotPasswordLoading}
				/>
			</div>
		</>
	);
}
