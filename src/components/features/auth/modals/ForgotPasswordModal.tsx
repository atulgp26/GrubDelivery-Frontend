"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { TextField } from "@/components/ui/text-field";
import Modal from "@/components/ui/Modal";
import { EMAIL_RULES } from "@/components/features/auth/validation";

export interface ForgotPasswordModalProps {
	open: boolean;
	onCloseAction: () => void;
	onNextAction: (email: string) => void;
	forgotPasswordLoading: boolean;
}

interface ForgotPasswordForm {
	email: string;
}

export default function ForgotPasswordModal({
	open,
	onCloseAction,
	onNextAction,
	forgotPasswordLoading,
}: ForgotPasswordModalProps) {
	const [focusedInput, setFocusedInput] = useState<"email" | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<ForgotPasswordForm>({
		mode: "onChange",
	});

	const emailField = register("email", EMAIL_RULES);

	const { onBlur: emailOnBlur, ...emailFieldProps } = emailField;

	const onSubmit = handleSubmit(({ email }) =>
		onNextAction(email.trim().toLowerCase()),
	);

	return (
		<Modal
			open={open}
			onClose={onCloseAction}
			width="w-[604px] max-w-full"
			height="h-auto max-h-full"
			noXPadding={true}
			showLogo
			closeOnOutsideClick={false}
		>
			<form
				onSubmit={onSubmit}
				className="flex flex-col gap-[24px] p-[24px] w-full"
			>
				{/* Text Section */}
				<div className="flex flex-col gap-[8px] w-full text-center">
					<h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
						Forgot password?
					</h2>
					<p className="text-[var(--color-neutral-secondary)] text-lg">
						It happens to the best of us. Enter your email and
						we&apos;ll send you a link to reset it
					</p>
				</div>

				{/* Email Input */}
				<div className="w-full">
					<TextField
						id="email"
						type="email"
						placeholder="Email ID"
						state="press"
						hasHoverEffect={true}
						leadingIcon={
							<Icon name="login_user" className="h-6 w-6" />
						}
						error={errors.email?.message}
						onFocus={() => setFocusedInput("email")}
						onBlur={(event) => {
							emailOnBlur(event);
							setFocusedInput(null);
						}}
						{...emailFieldProps}
					/>
				</div>

				{/* Button Section */}
				<Button
					variant="primary"
					appearance="outlined"
					type="submit"
					disabled={!isValid || forgotPasswordLoading}
					size="xl"
					state="press"
					className="w-full text-[20px]"
				>
					<span>NEXT</span>
				</Button>
			</form>
		</Modal>
	);
}
